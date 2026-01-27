// 위치: frontend/src/app/api/bff/admin/depts/[deptId]/majors/route.ts

import { NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:8080"; // 포스트맨에서 쓰던 백엔드 주소

type RouteParams = {
  params: { deptId: string };
};

/**
 * 전공 목록 조회
 * 프론트: GET  /api/bff/admin/depts/:deptId/majors?page=1&size=20
 * 백엔드: GET  /api/v1/admin/depts/{deptId}/majors?page=1&size=20
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { deptId } = params;

  try {
    const url = new URL(request.url);
    const search = url.searchParams.toString();
    const query = search ? `?${search}` : "";

    const res = await fetch(
      `${BACKEND_URL}/api/v1/admin/depts/${deptId}/majors${query}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[BFF] GET /admin/depts/:deptId/majors error:", error);
    return NextResponse.json(
      { message: "[BFF] GET /admin/depts/:deptId/majors error" },
      { status: 500 }
    );
  }
}

/**
 * 전공 생성
 * 프론트: POST /api/bff/admin/depts/:deptId/majors
 * 백엔드: POST /api/v1/admin/depts/{deptId}/majors
 *
 * ⚠ 백엔드는 Authorization 헤더의 Bearer 토큰을 보고 권한 체크를 한다고 가정.
 *    → 프론트에서 온 cookie(access_token)를 꺼내서 Authorization으로 변환해서 보낸다.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { deptId } = params;

  try {
    const body = await request.json();

    // 1) 클라이언트에서 온 Cookie 헤더에서 access_token 뽑기
    const cookieHeader = request.headers.get("cookie") ?? "";
    let accessToken = "";

    const match = cookieHeader.match(
      /(?:^|;\s*)access_token=([^;]+)/
    );
    if (match && match[1]) {
      accessToken = match[1];
    }

    console.log("[BFF] majors POST - extracted accessToken:", !!accessToken);

    // 2) 백엔드로 전달할 헤더 구성
    const backendHeaders: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      backendHeaders["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch(
      `${BACKEND_URL}/api/v1/admin/depts/${deptId}/majors`,
      {
        method: "POST",
        headers: backendHeaders,
        body: JSON.stringify(body),
      }
    );

    console.log("[BFF] majors backend status:", res.status);

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      console.error("[BFF] NON_JSON:", text.slice(0, 300));
      return NextResponse.json(
        { error: text.slice(0, 200) },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[BFF] POST major error:", error);
    return NextResponse.json(
      { message: "[BFF] POST major error" },
      { status: 500 }
    );
  }
}
