import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:depts";

// GET: 수정 폼 데이터 조회
export async function GET(
    req: Request,
    { params }: { params: { deptId: string } }
) {
    const { deptId } = params;

    return proxyToBackend(
        req,
        `/api/v1/admin/depts/${deptId}/edit`,
        {
            method: "GET",
            forwardQuery: false,
            cache: "no-store", // 최신 데이터 필요
        }
    );
}

// PATCH: 학과 정보 수정
export async function PATCH(
    req: Request,
    { params }: { params: { deptId: string } }
) {
    const { deptId } = params;
    const body = await req.json();

    const res = await proxyToBackend(
        req,
        `/api/v1/admin/depts/${deptId}/edit`,
        {
            method: "PATCH",
            body: body,
            forwardQuery: false,
            cache: "no-store",
        }
    );

    if (res.ok) {
        revalidateTag(TAG);
    }

    return res;
}
