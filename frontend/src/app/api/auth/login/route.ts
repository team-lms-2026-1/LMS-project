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

function containsHangul(value?: string) {
  return /[\u3131-\u318E\uAC00-\uD7A3]/.test(String(value ?? ""));
}

function pickEnglishMessage(candidate: string | undefined, fallback: string) {
  if (!candidate) return fallback;
  return containsHangul(candidate) ? fallback : candidate;
}

export async function POST(req: Request) {
  let body: LoginRequest;
  try {
    body = (await req.json()) as LoginRequest;
  } catch {
    return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
  }

  if (!body?.loginId || !body?.password) {
    return NextResponse.json({ message: "Please enter both ID and password." }, { status: 400 });
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
      { message: "Failed to connect to the authentication server.", detail },
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
    const upstreamMessage = payload?.error?.message ?? payload?.message;
    const message = pickEnglishMessage(upstreamMessage, "Login failed. Please check your credentials.");
    return NextResponse.json({ message }, { status: upstreamRes.status });
  }

  const data = payload?.data;
  if (!data?.accessToken || !data?.expiresInSeconds || !data?.account) {
    return NextResponse.json(
      { message: "Invalid response format from the authentication server." },
      { status: 502 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set("access_token", data.accessToken, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
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
