// 위치: frontend/src/app/api/bff/admin/depts/[deptId]/route.ts

import { proxyToBackend } from "@/lib/bff";

type RouteParams = {
    params: { deptId: string };
};

// 🔹 학과 요약/상세 조회 (GET)
export async function GET(req: Request, { params }: RouteParams) {
    const { deptId } = params;

    return proxyToBackend(req, `/api/v1/admin/depts/${deptId}`, {
        method: "GET",
        cache: "no-store",
        forwardQuery: true,
    });
}
