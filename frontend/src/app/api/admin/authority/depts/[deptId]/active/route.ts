import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:depts";

export async function PATCH(
    req: Request,
    { params }: { params: { deptId: string } }
) {
    const { deptId } = params;
    const body = await req.json();

    const res = await proxyToBackend(
        req,
        `/api/v1/admin/depts/${deptId}/active`,
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
