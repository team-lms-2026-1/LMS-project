// frontend/src/app/api/departments/[departmentId]/route.ts
import { NextRequest, NextResponse } from "next/server";

// 공통 베이스 URL 방어
const BFF_BASE_URL =
  process.env.BFF_BASE_URL && process.env.BFF_BASE_URL.trim().length > 0
    ? process.env.BFF_BASE_URL.trim()
    : "http://localhost:8080";

const DEPT_API_PATH = "/api/v1/admin/depts";

interface RouteParams {
  params: { departmentId: string };
}

// 공통 헤더 유틸 (원하면 여기로 복붙하거나, 공용 파일로 빼도 좋고)
function buildProxyHeaders(
  req: NextRequest,
  extra: Record<string, string> = {}
): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...extra,
  };

  const auth = req.headers.get("authorization");
  if (auth) headers["authorization"] = auth;

  const cookie = req.headers.get("cookie");
  if (cookie) headers["cookie"] = cookie;

  return headers;
}

/** GET /api/departments/{id} */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { departmentId } = params;
  const url = `${BFF_BASE_URL}${DEPT_API_PATH}/${departmentId}`;
  console.log("[BFF Proxy][GET detail] ->", url);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: buildProxyHeaders(req),
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) {
      console.error(
        `BFF GET ${DEPT_API_PATH}/${departmentId} 실패`,
        res.status,
        await res.text()
      );
      return NextResponse.json(
        { message: "학과 정보를 불러오지 못했습니다." },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("BFF GET department 에러", err);
    return NextResponse.json(
      { message: "서버 통신 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/** PATCH /api/departments/{id} */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { departmentId } = params;
  const url = `${BFF_BASE_URL}${DEPT_API_PATH}/${departmentId}`;
  console.log("[BFF Proxy][PATCH] ->", url);

  try {
    const body = await req.json();

    const res = await fetch(url, {
      method: "PATCH",
      headers: buildProxyHeaders(req, {
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(body),
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) {
      console.error(
        `BFF PATCH ${DEPT_API_PATH}/${departmentId} 실패`,
        res.status,
        await res.text()
      );
      return NextResponse.json(
        { message: "학과 수정 실패" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("BFF PATCH department 에러", err);
    return NextResponse.json(
      { message: "서버 통신 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/** DELETE /api/departments/{id} */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { departmentId } = params;
  const url = `${BFF_BASE_URL}${DEPT_API_PATH}/${departmentId}`;
  console.log("[BFF Proxy][DELETE] ->", url);

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: buildProxyHeaders(req),
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) {
      console.error(
        `BFF DELETE ${DEPT_API_PATH}/${departmentId} 실패`,
        res.status,
        await res.text()
      );
      return NextResponse.json(
        { message: "학과 삭제 실패" },
        { status: res.status }
      );
    }

    return NextResponse.json(null, { status: res.status });
  } catch (err) {
    console.error("BFF DELETE department 에러", err);
    return NextResponse.json(
      { message: "서버 통신 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
