import { proxyToBackend } from "@/lib/bff";

export async function GET(req: Request, { params }: {params: { offeringId: string }}) {
  return proxyToBackend(req, `/api/v1/student/extra-curricular/offerings/${params.offeringId}`, {
    method: "GET",
    cache: "no-store"
  });
}