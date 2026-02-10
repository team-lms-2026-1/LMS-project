// app/api/admin/authority/depts/[deptId]/active/route.ts

import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:depts";

export async function PATCH(
    req: Request,
    { params }: { params: { deptId: string } }
) {
    const { deptId } = params;

    // 프론트에서 JSON.stringify로 보냈으니, 여기서 객체로 한 번 파싱
    const body = await req.json();

    // 실제 백엔드 엔드포인트 (기존 스타일 기반 추측)
    const res = await proxyToBackend(req, `/api/v1/admin/depts/${deptId}/active`, {
        method: "PATCH",
        body,             // proxyToBackend가 다시 JSON.stringify 해줌
        forwardQuery: false,
        cache: "no-store",
    });

    if (res.ok) {
        revalidateTag(TAG);
    }

    // proxyToBackend가 이미 JSON + status 맞춰서 NextResponse로 만들어줌
    return res;
}
