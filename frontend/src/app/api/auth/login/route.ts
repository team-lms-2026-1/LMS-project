import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { LoginRequest, LoginSuccess } from "@/features/auth/types";

const AUTH_API_BASE_URL = process.env.AUTH_API_BASE_URL;
const AUTH_LOGIN_PATH = process.env.AUTH_LOGIN_PATH || "/auth/login";

export async function POST(req: Request) {
  if (!AUTH_API_BASE_URL) {
    return NextResponse.json(
      { message: "서버 설정 오류: AUTH_API_BASE_URL 누락" },
      { status: 500 }
    );
  }

  let body: LoginRequest;
  try {
    body = (await req.json()) as LoginRequest;
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (!body?.id || !body?.password) {
    return NextResponse.json({ message: "아이디/비밀번호를 입력하세요." }, { status: 400 });
  }

  // 실제 백엔드로 프록시
  const upstreamUrl = `${AUTH_API_BASE_URL}${AUTH_LOGIN_PATH}`;

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 필요 시 추가 헤더(예: API Key, Tenant 등)
      },
      body: JSON.stringify({
        // 백엔드 스펙에 맞춰 키를 변경하세요.
        // 예: username/password 를 요구하는 경우
        id: body.id,
        password: body.password,
      }),
      // 백엔드가 쿠키 세션을 쓰고 BFF가 그걸 받아야 한다면:
      // credentials는 node fetch에서 의미가 제한적이라, 보통 set-cookie를 처리하는 방식으로 갑니다.
    });
  } catch {
    return NextResponse.json(
      { message: "인증 서버 연결에 실패했습니다." },
      { status: 502 }
    );
  }

  // 백엔드 에러 패스스루
  if (!upstreamRes.ok) {
    let errMsg = "로그인에 실패했습니다.";
    try {
      const err = await upstreamRes.json();
      if (typeof err?.message === "string") errMsg = err.message;
    } catch {
      // ignore
    }
    return NextResponse.json({ message: errMsg }, { status: upstreamRes.status });
  }

  // 백엔드 성공 응답 파싱(토큰/유저정보 등)
  let data: LoginSuccess = {};
  try {
    data = (await upstreamRes.json()) as LoginSuccess;
  } catch {
    // 백엔드가 바디 없이 200을 주는 케이스면 여기로 옴
    data = {};
  }

  /**
   * 토큰 기반이면 BFF가 HttpOnly 쿠키로 저장하는 것을 권장합니다.
   * - accessToken은 짧게(예: 15m~1h)
   * - refreshToken은 길게(예: 7d~30d)
   *
   * 백엔드 응답 키(accessToken/refreshToken)가 다르면 아래를 수정하세요.
   */
  const cookieStore = await cookies();

  if (data.accessToken) {
    cookieStore.set("access_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // maxAge: 60 * 60, // 1h (필요 시)
    });
  }

  if (data.refreshToken) {
    cookieStore.set("refresh_token", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // maxAge: 60 * 60 * 24 * 14, // 14d (필요 시)
    });
  }

  // 프론트로 내려줄 값(보안상 토큰은 내려주지 않는 것을 권장)
  // 필요한 최소 정보만 반환
  return NextResponse.json(
    {
      user: data.user ?? { id: body.id },
    },
    { status: 200 }
  );
}
