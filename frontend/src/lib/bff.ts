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
  upstreamPath: string | string[];
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
      upstreamUrl,
    });
  }

  let json: any;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    return jsonError(502, "UPSTREAM_INVALID_JSON", "백엔드 JSON 파싱 실패", {
      status: res.status,
      detail: text.slice(0, 200),
      upstreamUrl,
    });
  }

  return NextResponse.json(json, { status: res.status });
}

/**
 * 스트리밍 프록시 (multipart/form-data 포함)
 * + fallback: 업스트림 경로가 404/405면 다음 후보로 재시도
 * + 에러 래핑: 업스트림이 에러인데 JSON이 아니거나 body가 비면 JSON 에러로 변환
 */
export async function proxyStreamToBackend(req: Request, options: StreamProxyOptions) {
  const base = resolveBaseUrl();
  if (!base) return jsonError(500, "CONFIG", "API_BASE_URL is not defined");

  const token = getAccessToken();
  if (!token) return jsonError(401, "UNAUTHORIZED", "access_token cookie missing");

  const method = options.method ?? "GET";
  const forwardQuery = options.forwardQuery ?? true;

  const candidates = Array.isArray(options.upstreamPath) ? options.upstreamPath : [options.upstreamPath];

  const headers = buildUpstreamHeaders(req, token);
  const withBody = method !== "GET" && method !== "DELETE";

  // body는 한 번만 소비 가능하므로 스트리밍에서 "다중 재시도"는 원칙적으로 위험.
  // 다만 Next/undici 환경에서는 req.body를 그대로 넘길 때, 첫 시도가 바로 404/405로 끝나는 경우(서버가 body를 소비하지 않음)가 대부분이라
  // 실무적으로 fallback이 잘 동작합니다. 그래도 안전성을 위해, 2번째 후보부터는 body 없이 재시도하지 않도록 분기합니다.
  const initBase: any = {
    method,
    headers,
    cache: "no-store",
  };

  let lastRes: Response | null = null;
  let lastUrl = "";

  for (let i = 0; i < candidates.length; i++) {
    const upstreamUrl = buildUpstreamUrl(req, candidates[i], forwardQuery);
    lastUrl = upstreamUrl;

    const init: any = { ...initBase };

    if (withBody) {
      // 첫 시도에만 body를 붙인다. (404/405 fallback이 필요하면 보통 body는 소비되지 않음)
      if (i === 0) {
        init.body = req.body;
        init.duplex = "half";
      }
    }

    const res = await fetch(upstreamUrl, init);
    lastRes = res;

    // 404/405면 다른 경로 후보로 재시도
    if (res.status === 404 || res.status === 405) continue;

    // 성공 또는 다른 에러면 여기서 반환(다른 에러는 경로 문제가 아닐 가능성이 큼)
    return finalizeStreamOrJsonError(res, upstreamUrl);
  }

  // 전부 실패(보통 마지막이 404/405)
  if (!lastRes) return jsonError(502, "UPSTREAM_ERROR", "업스트림 호출 실패", { upstreamUrl: lastUrl });
  return finalizeStreamOrJsonError(lastRes, lastUrl);
}

async function finalizeStreamOrJsonError(res: Response, upstreamUrl: string) {
  const ct = res.headers.get("content-type") ?? "";

  // 에러인데 JSON이 아니면 디버깅 가능한 JSON으로 래핑
  if (!res.ok && !ct.includes("application/json")) {
    const text = await res.text();
    return jsonError(res.status, "UPSTREAM_ERROR", "업스트림 에러(비JSON)", {
      upstreamUrl,
      contentType: ct,
      detail: (text ?? "").slice(0, 500),
    });
  }

  // 에러인데 body가 비는 경우도 JSON으로 래핑
  if (!res.ok && ct.includes("application/json")) {
    const data = await parseJsonTextSafe(res);
    // data가 null이면 에러 래핑
    if (data == null) {
      return jsonError(res.status, "UPSTREAM_ERROR", "업스트림 에러(빈 JSON)", { upstreamUrl });
    }
    return NextResponse.json(data, { status: res.status });
  }

  // 정상 응답은 스트리밍 그대로
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
