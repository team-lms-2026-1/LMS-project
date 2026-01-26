// src/app/api/admin/community/notices/[noticeId]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const BASE_UPSTREAM = "/api/v1/admin/community/resources";

function getBaseUrl() {
  return process.env.ADMIN_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://localhost:8080";
}

function getAccessToken() {
  return cookies().get("access_token")?.value;
}

function buildUpstreamHeaders(req: Request) {
  const headers = new Headers(req.headers);

  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("cookie");
  headers.delete("accept-encoding");

  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return headers;
}

async function proxy(req: Request, upstreamUrl: string, method: string, withBody: boolean) {
  const headers = buildUpstreamHeaders(req);

  const init: any = {
    method,
    headers,
    cache: "no-store",
  };

  if (withBody) {
    init.body = req.body;
    init.duplex = "half";
  }

  const res = await fetch(upstreamUrl, init);

  const outHeaders = new Headers(res.headers);
  outHeaders.delete("transfer-encoding");

  return new NextResponse(res.body, {
    status: res.status,
    headers: outHeaders,
  });
}

export async function GET(req: Request, ctx: { params: { noticeId: string } }) {
  const upstreamUrl = `${getBaseUrl()}${BASE_UPSTREAM}/${encodeURIComponent(ctx.params.noticeId)}`;
  return proxy(req, upstreamUrl, "GET", false);
}

export async function PATCH(req: Request, ctx: { params: { noticeId: string } }) {
  const upstreamUrl = `${getBaseUrl()}${BASE_UPSTREAM}/${encodeURIComponent(ctx.params.noticeId)}`;
  // ✅ multipart 스트리밍 전달
  return proxy(req, upstreamUrl, "PATCH", true);
}

export async function DELETE(req: Request, ctx: { params: { noticeId: string } }) {
  const upstreamUrl = `${getBaseUrl()}${BASE_UPSTREAM}/${encodeURIComponent(ctx.params.noticeId)}`;
  return proxy(req, upstreamUrl, "DELETE", false);
}
