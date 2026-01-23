// 위치: frontend/src/app/api/bff/admin/depts/[deptId]/route.ts

import { proxyToBackend } from "@/lib//bff"; // ✅ 목록 route.ts와 동일 경로
import type { NextRequest } from "next/server";

type Params = {
  params: {
    deptId: string;
  };
};

/**
 * 학과 상세 조회 BFF
 * 프론트: GET /api/bff/admin/depts/:deptId
 * 백엔드: GET /api/v1/admin/depts/:deptId/summary
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { deptId } = params;

  // 디버깅용 로그 (서버 콘솔)
  console.log("[BFF] dept summary 요청, deptId =", deptId);

  // 🔥 핵심: 실제 백엔드 path에 /summary 붙여주기
  return proxyToBackend(
    req,
    `/api/v1/admin/depts/${deptId}/summary`
  );
}
