import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:extra-curriculars-master";

export async function GET(req: Request, { params }: {params: { id: string }}) {
  return proxyToBackend(req, `/api/v1/admin/extra-curricular/extra-curriculars/${params.id}`, {
    method: "GET",
    cache: "no-store"
  });
}

export async function PATCH(req:Request, { params }: {params: {id: string }}) {
    const body = await req.json();

    const res = await proxyToBackend(req, `/api/v1/admin/extra-curricular/extra-curriculars/${params.id}`, {
        method: "PATCH",
        body,
        cache: "no-store"
    })

    if (res.ok) revalidateTag(TAG);

    return res;
}