import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

function getBaseUrl() {
  // accounts BFF와 동일한 전략: ADMIN → AUTH fallback
  return process.env.ADMIN_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://localhost:8080";
}

// 여기만 백엔드 라우팅에 맞게 수정
const BASE_UPSTREAM = "/api/v1/admin/notices";

function buildHeaders() {
  const token = cookies().get("access_token")?.value;

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

async function parseErrorMessage(res: Response, fallback: string) {
  try {
    const err = (await res.json()) as ApiResponse<unknown>;
    if (typeof err?.message === "string" && err.message.trim().length > 0) return err.message;
  } catch {
    // ignore
  }
  return fallback;
}

/**
 * GET /api/community/notices?category=&keyword=&page=&size=
 * -> upstream GET /api/v1/admin/notices?... (동일 query 전달)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const qs = url.searchParams.toString();
  const upstreamUrl = `${getBaseUrl()}${BASE_UPSTREAM}${qs ? `?${qs}` : ""}`;

  console.log("[BFF][NOTICES] upstreamUrl(GET) =", upstreamUrl);

  const res = await fetch(upstreamUrl, {
    method: "GET",
    headers: buildHeaders(),
    cache: "no-store",
  });

  // ✅ 백엔드 에러 바디까지 찍기 (JSON이 아닐 수도 있어서 text)
  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    console.error("[BFF][NOTICES] upstream error", {
      status: res.status,
      statusText: res.statusText,
      body: bodyText?.slice(0, 2000),
    });

    return NextResponse.json(
      { message: `Upstream error (${res.status})`, upstreamBody: bodyText },
      { status: res.status }
    );
  }

  // ✅ 성공도 text로 받고 그대로 반환(래핑 형태 달라도 안전)
  const bodyText = await res.text();
  return new NextResponse(bodyText, {
    status: 200,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}


/**
 * POST /api/community/notices
 * -> upstream POST /api/v1/admin/notices
 */
export async function POST(req: Request) {
  const upstreamUrl = `${getBaseUrl()}${BASE_UPSTREAM}`;
  const body = await req.json().catch(() => null);

  const res = await fetch(upstreamUrl, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const message = await parseErrorMessage(res, `Upstream error (${res.status})`);
    return NextResponse.json({ message }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data, { status: 200 });
}
