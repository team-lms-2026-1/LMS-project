import { proxyStreamToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";

const TAG = "student:mypage";

export async function POST(req: Request, { params }: { params: { accountId: string } }) {
    const accountId = params.accountId;
    const res = await proxyStreamToBackend(req, {
        method: "POST",
        upstreamPath: `/api/v1/admin/mypage/student/${accountId}/image`,
    });

    if (res.ok) revalidateTag(TAG);
    return res;
}

export async function PATCH(req: Request, { params }: { params: { accountId: string } }) {
    const accountId = params.accountId;
    const res = await proxyStreamToBackend(req, {
        method: "PATCH",
        upstreamPath: `/api/v1/admin/mypage/student/${accountId}/image`,
    });

    if (res.ok) revalidateTag(TAG);
    return res;
}

export async function GET(req: Request, { params }: { params: { accountId: string } }) {
    const accountId = params.accountId;
    return proxyStreamToBackend(req, {
        method: "GET",
        upstreamPath: `/api/v1/admin/mypage/student/${accountId}/image`,
    });
}

export async function DELETE(req: Request, { params }: { params: { accountId: string } }) {
    const accountId = params.accountId;
    const res = await proxyStreamToBackend(req, {
        method: "DELETE",
        upstreamPath: `/api/v1/admin/mypage/student/${accountId}/image`,
    });

    if (res.ok) revalidateTag(TAG);
    return res;
}
