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
    cache: "no-store",
  });
}

/**
 * 학과 생성 BFF
 * 프론트: POST /api/bff/admin/depts
 * 백엔드: POST /api/v1/admin/depts
 */
export async function POST(req: NextRequest) {
  const body = await req.json(); // ✅ 프론트에서 온 JSON 읽기

  return proxyToBackend(req, "/api/v1/admin/depts", {
    method: "POST",
    body,          // ✅ 실제로 백엔드로 전송할 JSON
    cache: "no-store",
  });
}
