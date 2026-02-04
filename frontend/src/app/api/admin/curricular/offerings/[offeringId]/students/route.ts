import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:curricular-offering-student";

export async function GET(req: Request, { params }: {params: { offeringId: string }}) {
  return proxyToBackend(req, `/api/v1/admin/curricular-offerings/${params.offeringId}/students`, {
    method: "GET",
    cache: "no-store"
  });
}
