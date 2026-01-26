import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ProxyOptions = {
  method?: HttpMethod;
  forwardQuery?: boolean;
  body?: unknown;
  headers?: Record<string, string>;
};

type StreamProxyOptions = {
  method?: HttpMethod;
  forwardQuery?: boolean;
  upstreamPath: string;
};

/** base url 결정: .env에 API_BASE_URL이 기본 */
function resolveBaseUrl() {
  return process.env.API_BASE_URL ?? process.env.ADMIN_API_BASE_URL ?? "http://localhost:8080";
}

function getAccessToken() {
  return cookies().get("access_token")?.value;
}

function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { code, message, ...(extra ?? {}) } }, { status });
}

function buildUpstreamUrl(req: Request, upstreamPath: string, forwardQuery: boolean) {
  const base = resolveBaseUrl().replace(/\/+$/, "");
  const urlObj = new URL(req.url);
  const qs = forwardQuery ? urlObj.search : "";
  return `${base}${upstreamPath}${qs}`;
}

/** 업스트림으로 보낼 헤더 구성: 원본 헤더 최대한 보존 + 불필요 헤더 제거 + Authorization 추가 */
function buildUpstreamHeaders(req: Request, token: string, extra?: Record<string, string>) {
  const headers = new Headers(req.headers);

  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("cookie"); // 토큰은 Authorization으로 전달
  headers.delete("accept-encoding"); // 압축 이슈 회피(선택)

  headers.set("Authorization", `Bearer ${token}`);

  if (extra) {
    for (const [k, v] of Object.entries(extra)) headers.set(k, v);
  }
  return headers;
}

async function parseJsonTextSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * JSON 프록시: 백엔드가 JSON을 반환한다는 전제
 * - access_token 쿠키 -> Authorization Bearer
 * - JSON 아닌 응답은 502로 래핑
 */
export async function proxyToBackend(req: Request, upstreamPath: string, options: ProxyOptions = {}) {
  const base = resolveBaseUrl();
  if (!base) return jsonError(500, "CONFIG", "API_BASE_URL is not defined");

  const token = getAccessToken();
  if (!token) return jsonError(401, "UNAUTHORIZED", "access_token cookie missing");

  const method = options.method ?? "GET";
  const forwardQuery = options.forwardQuery ?? true;
  const upstreamUrl = buildUpstreamUrl(req, upstreamPath, forwardQuery);

  const headers = new Headers();
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  if (options.body) headers.set("Content-Type", "application/json");
  if (options.headers) {
    for (const [k, v] of Object.entries(options.headers)) headers.set(k, v);
  }

  const res = await fetch(upstreamUrl, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text();

  if (!contentType.includes("application/json")) {
    return jsonError(502, "UPSTREAM_NOT_JSON", "백엔드가 JSON이 아닌 응답을 반환", {
      status: res.status,
      detail: text.slice(0, 200),
    });
  }

  let json: any;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    return jsonError(502, "UPSTREAM_INVALID_JSON", "백엔드 JSON 파싱 실패", {
      status: res.status,
      detail: text.slice(0, 200),
    });
  }

  return NextResponse.json(json, { status: res.status });
}

/**
 * 스트리밍 프록시 (multipart/form-data 포함)
 * - 요청 헤더 최대한 보존
 * - req.body를 그대로 업스트림으로 전달 (formData()로 읽지 않음)
 * - 업스트림 응답도 res.body 스트림 그대로 반환
 */
export async function proxyStreamToBackend(req: Request, options: StreamProxyOptions) {
  const base = resolveBaseUrl();
  if (!base) return jsonError(500, "CONFIG", "API_BASE_URL is not defined");

  const token = getAccessToken();
  if (!token) return jsonError(401, "UNAUTHORIZED", "access_token cookie missing");

  const method = options.method ?? "GET";
  const forwardQuery = options.forwardQuery ?? true;
  const upstreamUrl = buildUpstreamUrl(req, options.upstreamPath, forwardQuery);

  const headers = buildUpstreamHeaders(req, token);

  const withBody = method !== "GET" && method !== "DELETE";

  const init: any = {
    method,
    headers,
    cache: "no-store",
  };

  if (withBody) {
    init.body = req.body;
    init.duplex = "half"; // Node(undici) ReadableStream
  }

  const res = await fetch(upstreamUrl, init);

  const outHeaders = new Headers(res.headers);
  outHeaders.delete("transfer-encoding");

  return new NextResponse(res.body, {
    status: res.status,
    headers: outHeaders,
  });
}

/** =========================
 *  클라이언트에서 /api(...) BFF 호출용
 *  ========================= */

export class BffError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`BFF request failed: ${status}`);
    this.status = status;
    this.body = body;
  }
}

export async function bffRequest<T>(
  path: string,
  options?: { method?: HttpMethod; body?: unknown; headers?: Record<string, string> }
): Promise<T> {
  const res = await fetch(path, {
    method: options?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });

  const data = await parseJsonTextSafe(res);
  if (!res.ok) throw new BffError(res.status, data);
  return data as T;
}
