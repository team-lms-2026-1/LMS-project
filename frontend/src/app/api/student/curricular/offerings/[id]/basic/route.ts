import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export async function GET(req: Request, { params }: {params: { id: string }}) {
  return proxyToBackend(req, `/api/v1/student/curriculars/${params.id}`, {
    method: "GET",
    cache: "no-store"
  });
}
