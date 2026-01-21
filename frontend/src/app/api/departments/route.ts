// app/api/bff/admin/depts/route.ts
import { NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:8080"; // ✅ Postman에서 쓰던 백엔드 주소

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/admin/depts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
