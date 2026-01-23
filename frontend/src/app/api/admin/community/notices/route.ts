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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const upstreamUrl = `${getBaseUrl()}${BASE_UPSTREAM}${url.search}`;

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

export async function POST(req: Request) {
  const upstreamUrl = `${getBaseUrl()}${BASE_UPSTREAM}`;

  const form = await req.formData();
  const res = await fetch(upstreamUrl, {
    method: "POST",
    headers: buildAuthHeadersOnly(), // ✅ Content-Type 직접 세팅 금지
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
