import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:extra-curricular-offering";

export async function GET(req: Request, { params }: {params: { offeringId: string }}) {
  return proxyToBackend(req, `/api/v1/admin/extra-curricular/offerings/${params.offeringId}`, {
    method: "GET",
    cache: "no-store"
  });
}

export async function PATCH(req:Request, { params }: {params: {offeringId: string }}) {
    const body = await req.json();

    const res = await proxyToBackend(req, `/api/v1/admin/extra-curricular/offerings/${params.offeringId}/basic`, {
        method: "PATCH",
        body,
        cache: "no-store"
    })

    if (res.ok) revalidateTag(TAG);

    return res;
}