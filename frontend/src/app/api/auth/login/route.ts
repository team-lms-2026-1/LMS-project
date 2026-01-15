import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// 프론트(UI)에서 쓰는 타입
import type { LoginRequest } from "@/features/auth/types";

// 백엔드 ApiResponse 형태(최소만)
type ApiResponse<T> = {
  // 실제 필드명은 프로젝트의 ApiResponse에 맞추세요.
  // 보통 success/data/message 정도는 있습니다.
  success?: boolean;
  message?: string;
  data?: T;
};

type BackendAuthLoginResponse = {
  accessToken: string;
  expiresInSeconds: number;
  account: {
    accountId: number;
    loginId: string;
    accountType: string;
  };
};

export async function POST(req: Request) {
  const base = process.env.AUTH_API_BASE_URL; // 예: http://localhost:8080
  if (!base) {
    return NextResponse.json(
      { message: "서버 설정 오류: AUTH_API_BASE_URL 누락" },
      { status: 500 }
    );
  }

  const loginApi = `${base}/api/v1/auth/login`;

  let body: LoginRequest;
  try {
    body = (await req.json()) as LoginRequest;
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (!body?.id || !body?.password) {
    return NextResponse.json({ message: "아이디/비밀번호를 입력하세요." }, { status: 400 });
  }

  console.log("[BFF] base=", process.env.AUTH_API_BASE_URL);
console.log("[BFF] upstreamUrl=", loginApi);

  let upstreamRes: Response;

  try {
    upstreamRes = await fetch(loginApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // 백엔드 스펙에 맞춤: loginId / password
      body: JSON.stringify({
        loginId: body.id,
        password: body.password,
      }),
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { message: "인증 서버 연결에 실패했습니다.", detail, loginApi },
      { status: 502 }
    );
  }

  // 백엔드가 4xx/5xx면 그대로 패스스루(메시지도 가능하면 전달)
  if (!upstreamRes.ok) {
    let errMsg = "로그인에 실패했습니다.";
    try {
      // 백엔드 ApiResponse 에러 형태에 따라 message를 꺼냄
      const err = (await upstreamRes.json()) as ApiResponse<unknown>;
      if (typeof err?.message === "string") errMsg = err.message;
    } catch {
      // ignore
    }
    return NextResponse.json({ message: errMsg }, { status: upstreamRes.status });

    
  }

  // 성공 파싱: ApiResponse<AuthLoginResponse>
  let payload: ApiResponse<BackendAuthLoginResponse>;
  try {
    payload = (await upstreamRes.json()) as ApiResponse<BackendAuthLoginResponse>;
  } catch {
    return NextResponse.json({ message: "백엔드 응답 파싱 실패" }, { status: 502 });
  }

  const data = payload?.data;
  if (!data?.accessToken) {
    return NextResponse.json(
      { message: "백엔드 응답에 accessToken이 없습니다.", payload },
      { status: 502 }
    );
  }

  // HttpOnly 쿠키 저장
  const cookieStore = await cookies();
  cookieStore.set("access_token", data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // expiresInSeconds 반영하고 싶으면 maxAge로:
    maxAge: data.expiresInSeconds,
  });

  // 프론트에는 필요한 최소 정보만 반환
  return NextResponse.json(
    {
      account: data.account,
      expiresInSeconds: data.expiresInSeconds,
    },
    { status: 200 }
  );
}
