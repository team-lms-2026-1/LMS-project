import { NextResponse } from "next/server";
import { cookies } from "next/headers";

function getBaseUrl() {
  return process.env.ADMIN_API_BASE_URL ?? process.env.API_BASE_URL;
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

/** upstream 응답을 그대로 내려줌 (성공/실패 모두) */
async function passthrough(upstreamRes: Response) {
  const text = await upstreamRes.text();
  return new Response(text, {
    status: upstreamRes.status,
    headers: {
      "content-type": upstreamRes.headers.get("content-type") ?? "application/json",
    },
  });
}

function requireBaseUrl() {
  const base = getBaseUrl();
  if (!base) {
    return NextResponse.json(
      { message: "서버 설정 오류: ADMIN_API_BASE_URL 또는 API_BASE_URL 누락" },
      { status: 500 }
    );
  }
  return base;
}

async function proxyToUpstream(
  method: "GET" | "PATCH",
  req: Request,
  ctx: { params: { accountId: string } }
) {
  const baseOrRes = requireBaseUrl();
  if (baseOrRes instanceof NextResponse) return baseOrRes;

  const base = baseOrRes as string;
  const accountId = ctx.params.accountId;
  const upstreamUrl = `${base}/api/v1/admin/accounts/${encodeURIComponent(accountId)}`;

  const init: RequestInit = {
    method,
    headers: buildHeaders(),
    cache: "no-store",
    credentials: "include",
  };

  // PATCH는 body 전달
  if (method === "PATCH") {
    // 원문 그대로 전달 (JSON stringify를 여기서 다시 하지 않음)
    const text = await req.text();
    init.body = text.length ? text : undefined;
  }

  const res = await fetch(upstreamUrl, init);
  return passthrough(res);
}

/** 상세 조회 */
export async function GET(req: Request, ctx: { params: { accountId: string } }) {
  return proxyToUpstream("GET", req, ctx);
}

/** 수정: 백엔드가 PATCH를 기대하므로 PATCH로 프록시 */
export async function PATCH(req: Request, ctx: { params: { accountId: string } }) {
  return proxyToUpstream("PATCH", req, ctx);
}

/**
 * 호환: 프론트가 PUT으로 호출해도 백엔드에는 PATCH로 전달
 * (프론트 수정이 끝나면 PUT은 제거해도 됨)
 */
export async function PUT(req: Request, ctx: { params: { accountId: string } }) {
  return proxyToUpstream("PATCH", req, ctx);
}
