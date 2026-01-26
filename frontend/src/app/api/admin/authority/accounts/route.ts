import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type ApiResponse<T> = { success?: boolean; message?: string; data?: T };

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

async function parseErrorMessage(res: Response, fallback: string) {
  try {
    const err = (await res.json()) as ApiResponse<unknown> & { error?: { message?: string } };
    return (
      (typeof err?.message === "string" && err.message.trim()) ||
      (typeof err?.error?.message === "string" && err.error.message.trim()) ||
      fallback
    );
  } catch {
    return fallback;
  }
}

/** upstream 응답을 그대로 내려줌 (성공/실패 모두) */
async function passthroughResponse(upstreamRes: Response) {
  const text = await upstreamRes.text();
  return new Response(text, {
    status: upstreamRes.status,
    headers: {
      "content-type": upstreamRes.headers.get("content-type") ?? "application/json",
    },
  });
}

/** keyword/search/query/q 중 하나라도 있으면 keyword로 통일 */
function pickKeyword(sp: URLSearchParams): string | undefined {
  const candidates = ["keyword", "search", "query", "q"];
  for (const k of candidates) {
    const v = (sp.get(k) ?? "").trim();
    if (v) return v;
  }
  return undefined;
}

export async function GET(req: Request) {
  const base = getBaseUrl();
  if (!base) {
    return NextResponse.json(
      { message: "서버 설정 오류: ADMIN_API_BASE_URL 또는 API_BASE_URL 누락" },
      { status: 500 }
    );
  }

  const inbound = new URL(req.url);
  const sp = inbound.searchParams;

  const page = Number(sp.get("page") ?? "0");
  const size = Number(sp.get("size") ?? "10");
  const accountType = (sp.get("accountType") ?? "").trim() || undefined;

  const keywordRaw = pickKeyword(sp);
  const keyword = (keywordRaw ?? "").trim() || undefined;

  const upstreamGet = new URL(`${base}/api/v1/admin/accounts`);
  upstreamGet.searchParams.set("page", String(page));
  upstreamGet.searchParams.set("size", String(size));
  if (accountType) upstreamGet.searchParams.set("accountType", accountType);
  if (keyword) upstreamGet.searchParams.set("keyword", keyword);

  let resGet: Response;
  try {
    resGet = await fetch(upstreamGet.toString(), {
      method: "GET",
      headers: buildHeaders(),
      credentials: "include",
      cache: "no-store",
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        message: "관리자 계정 목록 서버 연결에 실패했습니다.",
        detail,
        upstreamUrl: upstreamGet.toString(),
      },
      { status: 502 }
    );
  }

  if (resGet.status === 405) {
    const upstreamPost = `${base}/api/v1/admin/accounts`;

    let resPost: Response;
    try {
      resPost = await fetch(upstreamPost, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({
          page,
          size,
          ...(accountType ? { accountType } : {}),
          ...(keyword ? { keyword } : {}),
        }),
        credentials: "include",
        cache: "no-store",
      });
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      return NextResponse.json(
        {
          message: "관리자 계정 목록(POST 폴백) 서버 연결에 실패했습니다.",
          detail,
          upstreamUrl: upstreamPost,
        },
        { status: 502 }
      );
    }

    return passthroughResponse(resPost);
  }

  if (!resGet.ok) {
    const msg = await parseErrorMessage(resGet, "계정 목록 조회에 실패했습니다.");
    return NextResponse.json({ message: msg }, { status: resGet.status });
  }

  return passthroughResponse(resGet);
}

export async function POST(req: Request) {
  const base = getBaseUrl();
  if (!base) {
    return NextResponse.json(
      { message: "서버 설정 오류: ADMIN_API_BASE_URL 또는 API_BASE_URL 누락" },
      { status: 500 }
    );
  }

  const upstreamUrl = `${base}/api/v1/admin/accounts`;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(upstreamUrl, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(body),
      credentials: "include",
      cache: "no-store",
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { message: "관리자 계정 등록 서버 연결에 실패했습니다.", detail, upstreamUrl },
      { status: 502 }
    );
  }

  // 성공/실패 모두 그대로 내려주면 프론트에서 메시지 확인이 쉬움
  return passthroughResponse(upstreamRes);
}
