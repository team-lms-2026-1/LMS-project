// src/lib/http.ts
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from "@/i18n/locale";
export class ApiError extends Error {
  status: number;
  body: any;

  constructor(message: string, status: number, body: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type JsonFetchOptions = RequestInit & {
  // 필요하면 나중에 확장 (예: timeout, retry 등)
};

function isObject(v: unknown): v is Record<string, any> {
  return typeof v === "object" && v !== null;
}

function pickErrorMessage(body: any, status: number) {
  if (isObject(body)) {
    return (
      body?.error?.message ||
      body?.message ||
      body?.error ||
      body?.msg ||
      body?.detail ||
      `HTTP_${status}`
    );
  }
  if (typeof body === "string" && body.trim()) return body;
  return `HTTP_${status}`;
}

export async function getJson<T>(input: string, init: JsonFetchOptions = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const hasBody =
    init.body != null && method !== "GET" && method !== "HEAD";

  // headers 병합
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  // Accept-Language 헤더 자동 추가
  if (typeof window !== "undefined") {
    const locale = localStorage.getItem(LOCALE_STORAGE_KEY) || DEFAULT_LOCALE;
    headers.set("Accept-Language", locale);
    console.log(`[HTTP] Accept-Language: ${locale} for ${method} ${input}`);
  }

  // body가 있고 Content-Type 미지정이면 JSON으로 기본 설정
  if (hasBody && !headers.has("Content-Type") && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(input, {
    ...init,
    method,
    headers,
    cache: init.cache ?? "no-store",
    credentials: init.credentials ?? "include",
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const contentLength = res.headers.get("content-length");

  // 204 No Content 또는 Content-Length가 0인 경우 빈 응답 처리
  if (res.status === 204 || contentLength === "0") {
    if (!res.ok) {
      throw new ApiError(`HTTP_${res.status}`, res.status, null);
    }
    return null as T;
  }

  // JSON이면 json 파싱, 아니면 text fallback
  // body가 비어있는 경우를 대비해 text()로 먼저 확인하거나 try-catch
  let body;
  try {
    if (isJson) {
      const text = await res.text();
      body = text ? JSON.parse(text) : null;
    } else {
      body = await res.text();
    }
  } catch (e) {
    body = null;
    // JSON 파싱 실패 시, 만약 OK 상태였다면 단순 빈 body일 수 있음.
  }

  if (!res.ok) {
    const msg = pickErrorMessage(body, res.status);

    console.error("[getJson] request failed =", {
      url: input,
      method,
      status: res.status,
      contentType,
      body,
    });

    throw new ApiError(msg, res.status, body);
  }

  return body as T;
}

export async function postJson<T>(input: string, bodyObj: any, init: JsonFetchOptions = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return getJson<T>(input, {
    ...init,
    method: "POST",
    headers,
    body: JSON.stringify(bodyObj),
  });
}

export async function patchJson<T>(input: string, bodyObj: any, init: JsonFetchOptions = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return getJson<T>(input, {
    ...init,
    method: "PATCH",
    headers,
    body: JSON.stringify(bodyObj),
  });
}

export async function deleteJson<T>(input: string, init: JsonFetchOptions = {}): Promise<T> {
  return getJson<T>(input, {
    ...init,
    method: "DELETE",
  });
}
