// src/app/api/admin/community/notices/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs"; // 스트리밍 프록시 안정화

const BASE_UPSTREAM = "/api/v1/admin/community/notices";

function getBaseUrl() {
  return process.env.ADMIN_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://localhost:8080";
}

function getAccessToken() {
  return cookies().get("access_token")?.value;
}

function buildUpstreamHeaders(req: Request) {
  // 들어온 헤더를 최대한 보존하되, 업스트림에서 혼동될 것들은 제거
  const headers = new Headers(req.headers);

  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("cookie"); // 토큰은 Authorization으로 전달할 것이므로 쿠키는 제거(권장)
  headers.delete("accept-encoding"); // 압축 관련 이슈 회피(선택)

  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return headers;
}

async function proxy(req: Request, upstreamUrl: string, method: string, withBody: boolean) {
  const headers = buildUpstreamHeaders(req);

  // 중요: multipart는 Content-Type을 건드리면 boundary가 깨질 수 있으니 그대로 둡니다.
  // (단, JSON 요청만 강제하고 싶으면 JSON용 라우트를 따로 두는 게 안전)
  const init: any = {
    method,
    headers,
    cache: "no-store",
  };

  if (withBody) {
    // ✅ formData()로 읽지 말고 스트림 그대로 전달
    init.body = req.body;
    // ✅ Node(undici)에서 ReadableStream 바디 사용 시 필요
    init.duplex = "half";
  }

  const res = await fetch(upstreamUrl, init);

  // 업스트림 응답을 거의 그대로 반환
  const outHeaders = new Headers(res.headers);
  outHeaders.delete("transfer-encoding"); // NextResponse가 알아서 처리
  // outHeaders.delete("content-encoding"); // 필요시 주석 해제

  return new NextResponse(res.body, {
    status: res.status,
    headers: outHeaders,
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const upstreamUrl = `${getBaseUrl()}${BASE_UPSTREAM}${url.search}`;
  return proxy(req, upstreamUrl, "GET", false);
}

export async function POST(req: Request) {
  const upstreamUrl = `${getBaseUrl()}${BASE_UPSTREAM}`;
  // ✅ multipart 스트리밍 전달
  return proxy(req, upstreamUrl, "POST", true);
}
