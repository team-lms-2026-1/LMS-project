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

function resolveBaseUrl() {
  return process.env.API_BASE_URL ?? process.env.ADMIN_API_BASE_URL ?? "http://localhost:8080";
}

function getAccessToken() {
  return cookies().get("access_token")?.value;
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
 * JSON 프록시 (route.ts에서 사용)
 * - access_token 쿠키 -> Authorization Bearer
 * - 업스트림이 JSON이 아니면 502로 래핑
 */
export async function proxyToBackend(req: Request, upstreamPath: string, options: ProxyOptions = {}) {
  const base = resolveBaseUrl();
  const token = getAccessToken();

  if (!token) {
    const out = NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "access_token cookie missing" } },
      { status: 401 }
    );
    out.headers.set("Cache-Control", "no-store");
    return out;
  }

  const forwardQuery = options.forwardQuery ?? true;
  const qs = forwardQuery ? new URL(req.url).search : "";
  const url = `${base.replace(/\/+$/, "")}${upstreamPath}${qs}`;

  // ✅ 기본은 무조건 no-store (리스트 갱신 문제 해결)
  //    캐시를 쓰고 싶으면 route.ts에서 options.cache/next를 명시해라.
  const cachePolicy: RequestCache = options.cache ?? "no-store";
  const nextOpt = cachePolicy === "no-store" ? undefined : (options.next ?? { revalidate: 0 });

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,

    // ✅ 핵심: 서버 fetch 캐시 차단
    cache: cachePolicy,
    next: nextOpt,
  });

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await readTextSafe(res);
    const out = NextResponse.json(
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
    out.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    out.headers.set("Pragma", "no-cache");
    out.headers.set("Expires", "0");
    return out;
  }

  const data = await parseJsonIfPossible(res);

  // ✅ 응답 헤더로도 캐시 완전 차단(브라우저/프록시 포함)
  const out = NextResponse.json(data, { status: res.status });
  out.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  out.headers.set("Pragma", "no-cache");
  out.headers.set("Expires", "0");

  return out;
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

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("cookie");
  headers.delete("accept-encoding");
  headers.set("Authorization", `Bearer ${token}`);

  const init: any = { method, headers, cache: "no-store" };
  if (withBody) {
    init.body = req.body;
    init.duplex = "half";
  }

  const res = await fetch(upstreamUrl, init);

  const outHeaders = new Headers(res.headers);
  outHeaders.delete("transfer-encoding");

  return new NextResponse(res.body, { status: res.status, headers: outHeaders });
}
