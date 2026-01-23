import { NextResponse } from "next/server";
import { cookies } from "next/headers";

function getBaseUrl() {
  return process.env.ADMIN_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://localhost:8080";
}

const BASE_UPSTREAM = "/api/v1/admin/community/notices";

function buildAuthHeadersOnly() {
  const token = cookies().get("access_token")?.value;
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

function buildJsonHeaders() {
  const headers = buildAuthHeadersOnly();
  headers.set("Content-Type", "application/json");
  return headers;
}

async function safeJson(res: Response) {
  try {
    if (res.status === 204 || res.status === 205) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function parseErrorMessage(res: Response, fallback: string) {
  const t = await res.text().catch(() => "");
  try {
    const j = t ? JSON.parse(t) : null;
    const m = j?.message || j?.error?.message;
    if (typeof m === "string" && m.trim()) return m;
  } catch {}
  return t?.trim() ? t : fallback;
}

export async function GET(_req: Request, ctx: { params: { noticeId: string } }) {
  const upstreamUrl = `${getBaseUrl()}${BASE_UPSTREAM}/${encodeURIComponent(ctx.params.noticeId)}`;

  const res = await fetch(upstreamUrl, {
    method: "GET",
    headers: buildJsonHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const message = await parseErrorMessage(res, `Upstream error (${res.status})`);
    return NextResponse.json({ message }, { status: res.status });
  }

  const data = await safeJson(res);
  return NextResponse.json(data ?? {}, { status: res.status });
}

/** ✅ 백엔드 스펙: PATCH + multipart(form-data: request, files) */
export async function PATCH(req: Request, ctx: { params: { noticeId: string } }) {
  const upstreamUrl = `${getBaseUrl()}${BASE_UPSTREAM}/${encodeURIComponent(ctx.params.noticeId)}`;

  const form = await req.formData();

  const res = await fetch(upstreamUrl, {
    method: "PATCH",
    headers: buildAuthHeadersOnly(), // ✅ boundary 자동 설정
    body: form as any,
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    const message = await parseErrorMessage(
      new Response(text, { status: res.status, headers: res.headers }),
      `Upstream error (${res.status})`
    );
    return NextResponse.json({ message, upstream: text }, { status: res.status });
  }

  return new NextResponse(text || "{}", {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(_req: Request, ctx: { params: { noticeId: string } }) {
  const upstreamUrl = `${getBaseUrl()}${BASE_UPSTREAM}/${encodeURIComponent(ctx.params.noticeId)}`;

  const res = await fetch(upstreamUrl, {
    method: "DELETE",
    headers: buildJsonHeaders(),
  });

  if (!res.ok) {
    const message = await parseErrorMessage(res, `Upstream error (${res.status})`);
    return NextResponse.json({ message }, { status: res.status });
  }

  const data = await safeJson(res);
  return NextResponse.json(data ?? {}, { status: res.status });
}
