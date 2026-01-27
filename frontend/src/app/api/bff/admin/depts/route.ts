// 위치: frontend/src/app/api/bff/admin/depts/route.ts

import { proxyToBackend } from "@/lib//bff";
import type { NextRequest } from "next/server";

/**
 * 학과 목록 조회 BFF
 * 프론트: GET /api/bff/admin/depts
 * 백엔드: GET /api/v1/admin/depts
 */

export async function GET(req: Request) {
  // Postman에서 쓰는 백엔드 경로가 /api/v1/admin/depts 인 경우
  return proxyToBackend(req, "/api/v1/admin/depts", {
    method: "GET",
  });
}


/**
 * 학과 생성 BFF
 * 프론트: POST /api/bff/admin/depts
 * 백엔드: POST /api/v1/admin/depts
 *
 * 요청 바디 예시:
 * {
 *   "deptCode": "CHEM",
 *   "deptName": "화학과",
 *   "description": "화학과"
 * }
 */
export async function POST(req: NextRequest) {
  return proxyToBackend(req, "/api/v1/admin/depts", {
    method: "POST",
    // body, headers는 proxyToBackend가 req에서 넘겨줌
  });
}
