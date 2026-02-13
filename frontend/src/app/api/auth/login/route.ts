import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type LoginRequest = {
  loginId: string;
  password: string;
};

type ApiResponse<T> = {
  data?: T;
  meta?: unknown;
  message?: string;
  error?: {
    code?: string;
    message?: string;
  };
};

type BackendLoginData = {
  accessToken: string;
  expiresInSeconds: number;
  account: {
    accountId: number;
    loginId: string;
    accountType: string;
  };
};

function resolveBaseUrl() {
  return process.env.API_BASE_URL ?? process.env.ADMIN_API_BASE_URL ?? "http://localhost:8080";
}

export async function POST(req: Request) {
  let body: LoginRequest;
  try {
    body = (await req.json()) as LoginRequest;
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (!body?.loginId || !body?.password) {
    return NextResponse.json({ message: "아이디/비밀번호를 입력하세요." }, { status: 400 });
  }

  const upstreamUrl = `${resolveBaseUrl().replace(/\/+$/, "")}/api/v1/auth/login`;
  let upstreamRes: Response;

  try {
    upstreamRes = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { message: "인증 서버 연결에 실패했습니다.", detail },
      { status: 502 }
    );
  }

  const raw = await upstreamRes.text();
  let payload: ApiResponse<BackendLoginData> | null = null;
  try {
    payload = raw ? (JSON.parse(raw) as ApiResponse<BackendLoginData>) : null;
  } catch {
    payload = null;
  }

  if (!upstreamRes.ok) {
    const message =
      payload?.error?.message ??
      payload?.message ??
      "로그인에 실패했습니다.";
    return NextResponse.json({ message }, { status: upstreamRes.status });
  }

  const data = payload?.data;
  if (!data?.accessToken || !data?.expiresInSeconds || !data?.account) {
    return NextResponse.json({ message: "백엔드 로그인 응답 형식이 올바르지 않습니다." }, { status: 502 });
  }

  const cookieStore = await cookies();
  cookieStore.set("access_token", data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: data.expiresInSeconds,
  });

  return NextResponse.json(
    {
      account: data.account,
      expiresInSeconds: data.expiresInSeconds,
      expiresAt: Date.now() + data.expiresInSeconds * 1000,
    },
    { status: 200 }
  );
}
