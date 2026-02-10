import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const ADMIN_TAG = "admin:extra-curricular-offering";
const STUDENT_TAG = "student:extra-curricular-offering";


export async function PATCH(req:Request, { params }: {params: {offeringId: string }}) {
    const body = await req.json();

    const res = await proxyToBackend(req, `/api/v1/admin/extra-curricular/offerings/${params.offeringId}/status`, {
        method: "PATCH",
        body,
        cache: "no-store"
    })

  if (res.ok) {
    revalidateTag(ADMIN_TAG);
    revalidateTag(STUDENT_TAG);
  }
    return res;
}