import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { resolveBaseUrl } from "@/lib/bff";

type ApiResponse<T> = { success?: boolean; message?: string; data?: T };

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

async function passthroughResponse(upstreamRes: Response) {
  const text = await upstreamRes.text();
  return new Response(text, {
    status: upstreamRes.status,
    headers: {
      "content-type": upstreamRes.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function POST(_req: Request, ctx: { params: { accountId: string } }) {
  const base = resolveBaseUrl();

  const accountId = ctx.params.accountId;
  const upstreamUrl = `${base}/api/v1/admin/accounts/${encodeURIComponent(accountId)}/password/reset`;

  const res = await fetch(upstreamUrl, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({}),
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) {
    const msg = await parseErrorMessage(res, `BFF request failed: ${res.status}`);
    return NextResponse.json({ message: msg, upstreamUrl }, { status: res.status });
  }

  return passthroughResponse(res);
}
