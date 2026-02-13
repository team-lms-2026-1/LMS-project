// src/lib/bff.ts
import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type ProxyOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  forwardQuery?: boolean;
  body?: unknown;
  headers?: Record<string, string>;

  // ✅ 추가됨!!!!
  cache?: RequestCache; // "force-cache" | "no-store" 등
  next?: { revalidate?: number; tags?: string[] };
};

type StreamProxyOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  forwardQuery?: boolean;
  upstreamPath: string;
};

export function resolveBaseUrl() {
  return process.env.API_BASE_URL ?? process.env.ADMIN_API_BASE_URL ?? "http://localhost:8080";
}

function getAccessToken() {
  return cookies().get("access_token")?.value;
}

function getClientIp(req: Request): string {
  // Try to get real IP from various headers (for proxy scenarios)
  const headers = req.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  // Fallback - in Next.js, this might be proxied
  return "unknown";
}

async function readTextSafe(res: Response) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

async function parseJsonIfPossible(res: Response) {
  const text = await readTextSafe(res);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * 공개 JSON 프록시 (로그인/로그아웃 등 인증 불필요한 엔드포인트용)
 * - 토큰 없이도 작동
 * - 업스트림이 JSON이 아니면 502로 래핑
 */
export async function proxyToBackendPublic(req: Request, upstreamPath: string, options: ProxyOptions = {}) {
  const base = resolveBaseUrl();

  const forwardQuery = options.forwardQuery ?? true;
  const qs = forwardQuery ? new URL(req.url).search : "";
  const url = `${base.replace(/\/+$/, "")}${upstreamPath}${qs}`;

  const clientIp = getClientIp(req);
  const userAgent = req.headers.get("user-agent") ?? "";

  try {
    const incomingAcceptLanguage = req.headers.get("accept-language");
    
    // 요청 본문 읽기 (POST/PATCH는 body 있음)
    let requestBody = options.body;
    if (!requestBody && (options.method === "POST" || options.method === "PATCH")) {
      const text = await req.text();
      requestBody = text ? JSON.parse(text) : undefined;
    }

    console.log("[BFF-Public] ->", options.method ?? "GET", url);

    const res = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        "X-Forwarded-For": clientIp,
        "User-Agent": userAgent,
        ...(requestBody ? { "Content-Type": "application/json" } : {}),
        ...(incomingAcceptLanguage ? { "Accept-Language": incomingAcceptLanguage } : {}),
        ...(options.headers ?? {}),
      },
      body: requestBody ? JSON.stringify(requestBody) : undefined,
      cache: options.cache ?? "no-store",
      next: options.next,
    });

    const contentType = res.headers.get("content-type") ?? "";
    const text = await readTextSafe(res);

    console.log("[BFF-Public] <-", res.status, contentType);

    if (!res.ok) {
      console.error("[BFF-Public] upstream error:", res.status, "body=", text.slice(0, 2000));
    }

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        {
          error: {
            code: "UPSTREAM_NOT_JSON",
            message: "백엔드가 JSON이 아닌 응답을 반환",
            status: res.status,
            detail: text.slice(0, 300),
          },
        },
        { status: 502 }
      );
    }

    const data = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;
    return NextResponse.json(data, { status: res.status });

  } catch (e) {
    console.error("[BFF-Public] fetch failed:", url, e);

    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다.", fieldErrors: null } },
      { status: 500 }
    );
  }
}

/**
 * 인증된 JSON 프록시 (route.ts에서 사용)
 * - access_token 쿠키 -> Authorization Bearer
 * - 업스트림이 JSON이 아니면 502로 래핑
 */
export async function proxyToBackend(req: Request, upstreamPath: string, options: ProxyOptions = {}) {
  const base = resolveBaseUrl();
  const token = getAccessToken();

  if (!token) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "access_token cookie missing" } },
      { status: 401 }
    );
  }

  const forwardQuery = options.forwardQuery ?? true;
  const qs = forwardQuery ? new URL(req.url).search : "";
  const url = `${base.replace(/\/+$/, "")}${upstreamPath}${qs}`;

  const clientIp = getClientIp(req);
  const userAgent = req.headers.get("user-agent") ?? "";

  // ✅ 여기부터 추가
  try {
    const incomingAcceptLanguage = req.headers.get("accept-language");

    const res = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-Forwarded-For": clientIp,
        "User-Agent": userAgent,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(incomingAcceptLanguage ? { "Accept-Language": incomingAcceptLanguage } : {}),
        ...(options.headers ?? {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: options.cache ?? "no-store",
      next: options.next,
    });

    const contentType = res.headers.get("content-type") ?? "";
    const text = await readTextSafe(res);

    console.log("[BFF] <-", res.status, contentType);

    // ✅ 업스트림이 에러면 body를 찍어라 (409 이유/메시지가 여기 있음)
    if (!res.ok) {
      console.error("[BFF] upstream error:", res.status, "body=", text.slice(0, 2000));
    }

    // JSON 체크
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        {
          error: {
            code: "UPSTREAM_NOT_JSON",
            message: "백엔드가 JSON이 아닌 응답을 반환",
            status: res.status,
            detail: text.slice(0, 300),
          },
        },
        { status: 502 }
      );
    }

    // ✅ text를 이미 읽었으니 여기서는 parse만
    const data = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;
    return NextResponse.json(data, { status: res.status });

  } catch (e) {
    // ✅ ECONNREFUSED 같은 게 여기로 옴
    console.error("[BFF] fetch failed:", url, e);

    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다.", fieldErrors: null } },
      { status: 500 }
    );
  }
}


/**
 * 스트리밍 프록시 (multipart/form-data 포함)
 */
export async function proxyStreamToBackend(req: Request, options: StreamProxyOptions) {
  const base = resolveBaseUrl();
  const token = getAccessToken();

  if (!token) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "access_token cookie missing" } },
      { status: 401 }
    );
  }

  const method = options.method ?? "GET";
  const withBody = method !== "GET" && method !== "DELETE";

  const forwardQuery = options.forwardQuery ?? true;
  const qs = forwardQuery ? new URL(req.url).search : "";
  const upstreamUrl = `${base.replace(/\/+$/, "")}${options.upstreamPath}${qs}`;

  const clientIp = getClientIp(req);

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("cookie");
  headers.delete("accept-encoding");
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("X-Forwarded-For", clientIp);

  const init: any = { method, headers, cache: "no-store" };
  if (withBody) {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const bodyText = await req.text();
      init.body = bodyText;
    } else {
      init.body = req.body;
      init.duplex = "half";
    }
  }

  const res = await fetch(upstreamUrl, init);

  const outHeaders = new Headers(res.headers);
  outHeaders.delete("transfer-encoding");

  return new NextResponse(res.body, { status: res.status, headers: outHeaders });
}