// src/lib/http.ts
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

  // body가 있고 Content-Type 미지정이면 JSON으로 기본 설정
  // (FormData 등은 호출부에서 Content-Type을 건드리지 말고 그대로 두는 게 안전)
  if (hasBody && !headers.has("Content-Type") && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(input, {
    ...init,
    method,
    headers,
    cache: init.cache ?? "no-store",

    // ✅ 중요: 쿠키(access_token)를 route.ts로 보내기 위해 필요
    credentials: init.credentials ?? "include",
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  // JSON이면 json 파싱, 아니면 text fallback
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");

  if (!res.ok) {
    const msg = pickErrorMessage(body, res.status);

    // 디버그는 한 곳에서만 관리
    console.error("[getJson] request failed =", {
      url: input,
      method,
      status: res.status,
      contentType,
      body,
    });

    throw new ApiError(msg, res.status, body);
  }

  // 성공인데 JSON이 아닌 경우도 예외 처리(계약 위반)
  if (!isJson) {
    throw new ApiError(`NON_JSON(${res.status})`, res.status, {
      head: String(body).slice(0, 300),
      contentType,
    });
  }

  return body as T;
}
