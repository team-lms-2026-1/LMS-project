// 위치: frontend/src/app/api/bff/admin/depts/route.ts

import { proxyToBackend } from "@/lib//bff";
import type { NextRequest } from "next/server";

/**
 * 학과 목록 조회 BFF
 * 프론트: GET /api/bff/admin/depts
 * 백엔드: GET /api/v1/admin/depts
 */
export async function GET(req: NextRequest) {
  return proxyToBackend(req, "/api/v1/admin/depts", {
    method: "GET",
    // 쿼리(page, size, keyword 등)는 proxyToBackend가 req에서 그대로 넘겨준다고 가정
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
