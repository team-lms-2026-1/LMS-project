// lib/http.ts
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

export async function getJson<T>(input: string, init: JsonFetchOptions = {}): Promise<T> {
  const res = await fetch(input, {
    ...init,
    method: init.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    cache: init.cache ?? "no-store",
  });

  const contentType = res.headers.get("content-type") ?? "";

  // JSON 아니면 텍스트로 읽고 에러
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new ApiError(`NON_JSON(${res.status})`, res.status, {
      head: text.slice(0, 300),
      contentType,
    });
  }

  const body = await res.json();

  if (!res.ok) {
    const msg =
      body?.error?.message ||
      body?.message ||
      body?.error ||
      `HTTP_${res.status}`;

    // 디버그: 필요하면 여기서만 콘솔 찍기 (한 곳에서 관리)
    console.error("[getJson] error body =", body);

    throw new ApiError(msg, res.status, body);
  }

  return body as T;
}
