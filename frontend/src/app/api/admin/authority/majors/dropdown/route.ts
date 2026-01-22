import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type ApiResponse<T> = { success?: boolean; message?: string; data?: T };

function getBaseUrl() {
  return process.env.ADMIN_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://localhost:8080";
}

function buildHeaders() {
  let token = cookies().get("access_token")?.value;

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

export async function GET() {
  const base = getBaseUrl();
  const upstreamUrl = `${base}/api/v1/majors/dropdown`;

  const res = await fetch(upstreamUrl, {
    method: "GET",
    headers: buildHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const msg = await parseErrorMessage(res, `BFF request failed: ${res.status}`);
    return NextResponse.json({ message: msg, upstreamUrl }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data, { status: 200 });
}
