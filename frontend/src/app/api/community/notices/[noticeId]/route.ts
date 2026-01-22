import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

function getBaseUrl() {
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

export async function GET(_req: Request, ctx: { params: { noticeId: string } }) {
  const upstreamUrl = `${getBaseUrl()}${BASE_UPSTREAM}/${encodeURIComponent(ctx.params.noticeId)}`;

  const res = await fetch(upstreamUrl, {
    method: "GET",
    headers: buildHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const message = await parseErrorMessage(res, `Upstream error (${res.status})`);
    return NextResponse.json({ message }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data, { status: 200 });
}

// PUT / PATCH 둘 중 백엔드 스펙에 맞춰 하나만 써도 됩니다.
export async function PUT(req: Request, ctx: { params: { noticeId: string } }) {
  const upstreamUrl = `${getBaseUrl()}${BASE_UPSTREAM}/${encodeURIComponent(ctx.params.noticeId)}`;
  const body = await req.json().catch(() => null);

  const res = await fetch(upstreamUrl, {
    method: "PUT",
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

export async function PATCH(req: Request, ctx: { params: { noticeId: string } }) {
  const upstreamUrl = `${getBaseUrl()}${BASE_UPSTREAM}/${encodeURIComponent(ctx.params.noticeId)}`;
  const body = await req.json().catch(() => null);

  const res = await fetch(upstreamUrl, {
    method: "PATCH",
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

export async function DELETE(_req: Request, ctx: { params: { noticeId: string } }) {
  const upstreamUrl = `${getBaseUrl()}${BASE_UPSTREAM}/${encodeURIComponent(ctx.params.noticeId)}`;

  const res = await fetch(upstreamUrl, {
    method: "DELETE",
    headers: buildHeaders(),
  });

  if (!res.ok) {
    const message = await parseErrorMessage(res, `Upstream error (${res.status})`);
    return NextResponse.json({ message }, { status: res.status });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: 200 });
}
