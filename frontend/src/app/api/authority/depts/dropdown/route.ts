import { NextResponse } from "next/server";
import { cookies } from "next/headers";

function getBaseUrl() {
  return process.env.ADMIN_API_BASE_URL ?? process.env.AUTH_API_BASE_URL ?? "http://localhost:8080";
}

function buildHeaders() {
  const token = cookies().get("access_token")?.value;

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

async function parseErrorMessage(res: Response, fallback: string) {
  try {
    const j = await res.json();
    if (typeof j?.message === "string" && j.message.trim()) return j.message;
  } catch {}
  return fallback;
}

export async function GET() {
  const upstreamUrl = `${getBaseUrl()}/api/v1/admin/depts/dropdown`;

  const res = await fetch(upstreamUrl, {
    method: "GET",
    headers: buildHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const msg = await parseErrorMessage(res, "학과 드롭다운 조회 실패");
    return NextResponse.json({ message: msg }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data, { status: 200 });
}
