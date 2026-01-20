import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

// 백엔드 리스트/등록 응답 타입을 정확히 알고 있으면 교체하세요.
type AdminAccountsListResponse = unknown;
type AdminAccountCreateResponse = unknown;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function getBaseUrl() {
  // 프로젝트에서 로그인 BFF가 AUTH_API_BASE_URL을 쓰고 있으니 우선 재사용
  return process.env.ADMIN_API_BASE_URL ?? process.env.AUTH_API_BASE_URL;
}

function buildHeaders() {
  let token = cookies().get("access_token")?.value;
  console.log("[BFF] has access_token cookie?", Boolean(token)); 

    if (token) {
      token = decodeURIComponent(token)
        .replace(/^"|"$/g, "")        // "..." 제거
        .replace(/^Bearer\s+/i, "")   // 이미 Bearer가 있으면 제거
        .trim();
    }

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const auth = headers.get("Authorization");
  console.log("[BFF] outbound Authorization=", auth ? auth.slice(0, 30) + "..." : null);  

  return headers;
}

async function parseErrorMessage(res: Response, fallback: string) {
  try {
    const err = (await res.json()) as ApiResponse<unknown>;
    if (typeof err?.message === "string" && err.message.trim().length > 0) {
      return err.message;
    }
  } catch {
    // ignore
  }
  return fallback;
}

/**
 * 백엔드 호출 유틸: text로 받아서 그대로 반환 (content-type 유지)
 */
async function passthroughResponse(upstreamRes: Response) {
  const text = await upstreamRes.text();
  return new Response(text, {
    status: upstreamRes.status,
    headers: {
      "content-type": upstreamRes.headers.get("content-type") ?? "application/json",
    },
  });
}

/**
 * GET 목록: 백엔드 GET이 405면 POST 검색 엔드포인트로 폴백
 */
export async function GET(req: Request) {
  const base = getBaseUrl();
  if (!base) {
    return NextResponse.json(
      { message: "서버 설정 오류: ADMIN_API_BASE_URL 또는 AUTH_API_BASE_URL 누락" },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") ?? "1");
  const size = Number(url.searchParams.get("size") ?? "10");

  // 1) 우선: 백엔드 GET /api/v1/admin/accounts?page=&size=
  const upstreamGet = new URL(`${base}/api/v1/admin/accounts`);
  upstreamGet.searchParams.set("page", String(page));
  upstreamGet.searchParams.set("size", String(size));

  console.log("[BFF] base=", base);
  console.log("[BFF] upstreamUrl(GET)=", upstreamGet.toString());

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

  // 405면: GET 미지원 → 폴백 POST 검색
    if (resGet.status === 405) {
    const upstreamPostSame = new URL(`${base}/api/v1/admin/accounts`);
    // upstreamPostSame.search = url.search; // 필요 없으면 제거 가능

    console.log("[BFF] GET not allowed. fallback to POST(same):", upstreamPostSame.toString());

    const accountType = url.searchParams.get("accountType") ?? undefined;
    const keyword = url.searchParams.get("keyword") ?? undefined;

    let resPostSame: Response;
    try {
        resPostSame = await fetch(upstreamPostSame.toString(), {
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
            message: "관리자 계정 목록(POST 동일경로 폴백) 서버 연결에 실패했습니다.",
            detail,
            upstreamUrl: upstreamPostSame.toString(),
        },
        { status: 502 }
        );
    }

    if (!resPostSame.ok) {
        return passthroughResponse(resPostSame); // 400이면 백엔드 메시지 확인용
    }

    return passthroughResponse(resPostSame);
    }

  // 405가 아니면: GET 결과 처리
  if (!resGet.ok) {
    const msg = await parseErrorMessage(resGet, "계정 목록 조회에 실패했습니다.");
    return NextResponse.json({ message: msg }, { status: resGet.status });
  }

  // 성공은 그대로 패스스루
  return passthroughResponse(resGet);
}

/**
 * POST 등록: 백엔드 POST /api/v1/admin/accounts 로 그대로 프록시
 */
export async function POST(req: Request) {
  const base = getBaseUrl();
  if (!base) {
    return NextResponse.json(
      { message: "서버 설정 오류: ADMIN_API_BASE_URL 또는 AUTH_API_BASE_URL 누락" },
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

  console.log("[BFF] base=", base);
  console.log("[BFF] upstreamUrl(POST)=", upstreamUrl);

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

  if (!upstreamRes.ok) {
    const msg = await parseErrorMessage(upstreamRes, "계정 등록에 실패했습니다.");
    return NextResponse.json({ message: msg }, { status: upstreamRes.status });
  }

  return passthroughResponse(upstreamRes);
}
