import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const BACKEND_URL = "http://localhost:8080";

function getAccessToken() {
  const cookieStore = cookies();
  return cookieStore.get("access_token")?.value;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();
    const upstreamUrl = `${BACKEND_URL}/api/v1/admin/depts?${queryString}`;

    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(upstreamUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await res.json();

    return NextResponse.json(data, {
      status: res.status,
    });
  } catch (error) {
    console.error("[BFF] /admin/depts error:", error);
    return NextResponse.json(
      { message: "BFF admin/depts error" },
      { status: 500 }
    );
  }
}
