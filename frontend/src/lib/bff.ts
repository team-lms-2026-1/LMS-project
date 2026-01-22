import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type ProxyOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  // 들어온 req에서 querystring을 그대로 붙일지
  forwardQuery?: boolean;
  // request body 전달이 필요한 경우(POST/PATCH 등)
  body?: unknown;
  // 추가 헤더
  headers?: Record<string, string>;
};

/**
 * Next.js route.ts에서 백엔드로 프록시(=BFF) 호출 후 결과를 그대로 내려준다.
 * - access_token 쿠키 -> Authorization Bearer
 * - JSON 아닌 응답은 502로 래핑
 */
export async function proxyToBackend(
  req: Request,
  backendPath: string, // 예: "/api/v1/admin/user-activity"
  options: ProxyOptions = {}
) {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json(
      { error: { code: "CONFIG", message: "API_BASE_URL is not defined" } },
      { status: 500 }
    );
  }

  const token = cookies().get("access_token")?.value;
  if (!token) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "access_token cookie missing" } },
      { status: 401 }
    );
  }

  const forwardQuery = options.forwardQuery ?? true;
  const qs = forwardQuery ? new URL(req.url).searchParams.toString() : "";
  const url = `${base}${backendPath}${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text();

  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      {
        error: {
          code: "UPSTREAM_NOT_JSON",
          message: "백엔드가 JSON이 아닌 응답을 반환",
          status: res.status,
          detail: text.slice(0, 200),
        },
      },
      { status: 502 }
    );
  }

  // JSON 파싱
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "UPSTREAM_INVALID_JSON",
          message: "백엔드 JSON 파싱 실패",
          status: res.status,
          detail: text.slice(0, 200),
        },
      },
      { status: 502 }
    );
  }

  return NextResponse.json(json, { status: res.status });
}