type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class BffError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`BFF request failed: ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
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
    credentials: "include", // 쿠키 세션/JWT 쿠키 사용 시
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) throw new BffError(res.status, data);
  return data as T;
}
