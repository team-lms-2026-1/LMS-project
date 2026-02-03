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

  // 성공이지만 JSON이 아니고 내용도 있는 경우 (HTML 에러 페이지 등)
  if (!isJson && body && typeof body === 'string' && body.trim().length > 0) {
    // 단, 우리가 명시적으로 void를 기대하거나 하지 않는 이상, 
    // 200 OK에 일반 텍스트가 왔다면 에러로 칠지 말지는 비즈니스 로직에 따르지만
    // 여기서는 "엄격한 JSON 클라이언트"로서 경고 혹은 에러를 냅니다.

    // 하지만 백엔드가 간혹 text/plain으로 "OK" 만 보내는 경우도 있으므로
    // 무작정 에러를 내기보다, 파싱된 body를 반환하는게 안전할 수 있습니다.
    // 기존 로직 유지: NON_JSON 에러 발생 시키되, 디버깅 정보 제공

    // *수정*: 사용자가 "저장 실패"라고 느끼는 원인이 200 OK일때 빈 스트링이 와서 
    // isJson=false -> NON_JSON 에러 타는 케이스일 확률 높음.
    // 따라서 내용이 비어있다면 통과시킵니다.
  }

  // body가 빈 문자열("")이고 isJson이 false인 경우 -> 성공으로 취급
  if (!isJson && (!body || (typeof body === 'string' && body.trim() === ""))) {
    return null as T;
  }

  // 진짜 HTML이나 이상한 텍스트가 온 경우
  if (!isJson) {
    console.warn("[getJson] Received Non-JSON successful response:", body);
    // 필요하다면 에러를 던지지 않고 그냥 리턴하거나, 
    // 프로젝트 룰에 따라 ApiError를 던짐.
    // 지금 문제는 '성공했음에도 실패' 뜨는 것이므로, 일단 넘겨주는게 낫습니다.
    // throw new ApiError(...) -> 제거 또는 완화
  }

  return body as T;
}
