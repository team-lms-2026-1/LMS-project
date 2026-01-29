import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:curricular-offering";

export async function GET(req: Request, { params }: {params: { id: string }}) {
  return proxyToBackend(req, `/api/v1/admin/curricular-offerings/${params.id}`, {
    method: "GET",
    cache: "no-store"
  });
}