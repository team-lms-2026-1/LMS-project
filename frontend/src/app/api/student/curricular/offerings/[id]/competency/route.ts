import { proxyToBackend } from "@/lib/bff";

export async function GET(req: Request, { params }: {params: { id: string }}) {
  return proxyToBackend(req, `/api/v1/student/curriculars/${params.id}/competency-mapping`, {
    method: "GET",
    cache: "no-store"
  });
}