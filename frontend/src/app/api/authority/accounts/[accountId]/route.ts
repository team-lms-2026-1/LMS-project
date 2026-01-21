import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type ApiResponse<T> = { success?: boolean; message?: string; data?: T };

function getBaseUrl() {
  return process.env.ADMIN_API_BASE_URL ?? process.env.AUTH_API_BASE_URL;
}

function buildHeaders() {
  let token = cookies().get("access_token")?.value;

  // ✅ 네 기존 accounts/route.ts의 토큰 정리 로직과 동일하게 적용
  if (token) {
    token = decodeURIComponent(token)
      .replace(/^"|"$/g, "")
      .replace(/^Bearer\s+/i, "")
      .trim();
  }

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

async function parseErrorMessage(res: Response, fallback: string) {
  try {
    const err = (await res.json()) as ApiResponse<unknown>;
    if (typeof err?.message === "string" && err.message.trim().length > 0) return err.message;
  } catch {}
  return fallback;
}

async function passthroughResponse(upstreamRes: Response) {
  const text = await upstreamRes.text();
  return new Response(text, {
    status: upstreamRes.status,
    headers: {
      "content-type": upstreamRes.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function GET(_req: Request, ctx: { params: { accountId: string } }) {
  const base = getBaseUrl();
  if (!base) {
    return NextResponse.json(
      { message: "서버 설정 오류: ADMIN_API_BASE_URL 또는 AUTH_API_BASE_URL 누락" },
      { status: 500 }
    );
  }

  const accountId = ctx.params.accountId;
  const upstreamUrl = `${base}/api/v1/admin/accounts/${encodeURIComponent(accountId)}`;

  const res = await fetch(upstreamUrl, {
    method: "GET",
    headers: buildHeaders(),
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) {
    const msg = await parseErrorMessage(res, `BFF request failed: ${res.status}`);
    return NextResponse.json({ message: msg, upstreamUrl }, { status: res.status });
  }

  return passthroughResponse(res);
}

export async function PUT(req: Request, ctx: { params: { accountId: string } }) {
  const base = getBaseUrl();
  if (!base) {
    return NextResponse.json(
      { message: "서버 설정 오류: ADMIN_API_BASE_URL 또는 AUTH_API_BASE_URL 누락" },
      { status: 500 }
    );
  }

  const accountId = ctx.params.accountId;
  const upstreamUrl = `${base}/api/v1/admin/accounts/${encodeURIComponent(accountId)}`;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const res = await fetch(upstreamUrl, {
    method: "PUT",
    headers: buildHeaders(),
    body: JSON.stringify(body),
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) {
    const msg = await parseErrorMessage(res, `BFF request failed: ${res.status}`);
    return NextResponse.json({ message: msg, upstreamUrl }, { status: res.status });
  }

  return passthroughResponse(res);
}
