import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:depts";

export async function PATCH(
    req: Request,
    { params }: { params: { deptId: string } }
) {
    const { deptId } = params;

    // 프론트에서 온 JSON 파싱
    const body = await req.json();

    // 🔧 여기서 반드시 JSON.stringify
    const res = await proxyToBackend(
        req,
        `/api/v1/admin/authority/depts/${deptId}/status`,
        {
            method: "PATCH",
            body: JSON.stringify(body),
            forwardQuery: false,
            cache: "no-store",
        }
    );

    if (res.ok) {
        revalidateTag(TAG);
    }

    return res;
}
