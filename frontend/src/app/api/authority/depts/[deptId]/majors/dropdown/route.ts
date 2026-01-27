// 위치: frontend/src/app/api/bff/admin/depts/[deptId]/majors/route.ts

import { proxyToBackend } from "@/lib/bff";

type RouteParams = {
  params: { deptId: string };
};

// 🔹 전공 목록 조회 (GET)
export async function GET(req: Request, { params }: RouteParams) {
  const { deptId } = params;

  // 쿼리스트링은 proxyToBackend가 알아서 넘겨줌 (forwardQuery 기본 true)
  return proxyToBackend(req, `/api/v1/admin/depts/${deptId}/majors`, {
    method: "GET",
  });
}

// 🔹 전공 생성 (POST)
export async function POST(req: Request, { params }: RouteParams) {
  const { deptId } = params;
  const body = await req.json();

  return proxyToBackend(req, `/api/v1/admin/depts/${deptId}/majors`, {
    method: "POST",
    body,              // proxyToBackend가 JSON.stringify 해줌
    forwardQuery: false,
  });
}
