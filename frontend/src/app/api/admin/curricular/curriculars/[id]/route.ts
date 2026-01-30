import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:curriculars";

export async function GET(req: Request, { params }: {params: { id: string }}) {
  return proxyToBackend(req, `/api/v1/admin/curriculars/${params.id}/edit`, {
    method: "GET",
    cache: "no-store"
  });
}

export async function PATCH(req:Request, { params }: {params: {id: string }}) {
    const body = await req.json();

    const res = await proxyToBackend(req, `/api/v1/admin/curriculars/${params.id}/edit`, {
        method: "PATCH",
        body,
        cache: "no-store"
    })

    if (res.ok) revalidateTag(TAG);

    return res;
}