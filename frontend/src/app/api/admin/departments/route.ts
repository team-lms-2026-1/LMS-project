import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const BACKEND_URL = "http://localhost:8080";

function getAccessToken() {
  const cookieStore = cookies();
  return cookieStore.get("access_token")?.value;
}

async function handleRequest(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();
    // 백엔드 URL 구성 (루트 경로)
    const upstreamUrl = `${BACKEND_URL}/api/v1/admin/depts${queryString ? `?${queryString}` : ""}`;

    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
      cache: "no-store",
    };

    // Body 처리 (GET, HEAD 제외)
    if (req.method !== "GET" && req.method !== "HEAD") {
      try {
        const bodyText = await req.text();
        if (bodyText) {
          fetchOptions.body = bodyText;
        }
      } catch (e) {
        console.warn("Failed to read request body", e);
      }
    }

    const res = await fetch(upstreamUrl, fetchOptions);

    let data;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }
    }

    if (data === undefined || data === null) {
      return new NextResponse(null, { status: res.status });
    }

    return NextResponse.json(data, {
      status: res.status,
    });
  } catch (error) {
    console.error(`[BFF] /admin/depts ${req.method} error:`, error);
    return NextResponse.json(
      { message: "BFF admin/depts error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) { return handleRequest(req); }
export async function POST(req: Request) { return handleRequest(req); }
