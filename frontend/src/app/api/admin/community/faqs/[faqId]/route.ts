import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const BACKEND_PATH = "/api/v1/admin/community/faqs";

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

  return new NextResponse(res.body, { status: res.status, headers: outHeaders });
}

export async function GET(req: Request, ctx: { params: { faqId: string } }) {
  const upstreamUrl = `${getBaseUrl()}${BACKEND_PATH}/${encodeURIComponent(ctx.params.faqId)}`;
  return proxy(req, upstreamUrl, "GET", false);
}

// ✅ 수정은 PATCH 우선(백엔드가 PUT이면 PUT도 같이 열어둠)
export async function PATCH(req: Request, ctx: { params: { faqId: string } }) {
  const upstreamUrl = `${getBaseUrl()}${BACKEND_PATH}/${encodeURIComponent(ctx.params.faqId)}`;
  return proxy(req, upstreamUrl, "PATCH", true);
}

export async function PUT(req: Request, ctx: { params: { faqId: string } }) {
  const upstreamUrl = `${getBaseUrl()}${BACKEND_PATH}/${encodeURIComponent(ctx.params.faqId)}`;
  return proxy(req, upstreamUrl, "PUT", true);
}

export async function DELETE(req: Request, ctx: { params: { faqId: string } }) {
  const upstreamUrl = `${getBaseUrl()}${BACKEND_PATH}/${encodeURIComponent(ctx.params.faqId)}`;
  return proxy(req, upstreamUrl, "DELETE", false);
}
