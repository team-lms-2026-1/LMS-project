import { proxyToBackend } from "@/lib/bff";

export async function GET(
  req: Request,
  { params }: { params: { offeringId: string; sessionId: string } }
) {
  return proxyToBackend(
    req,
    `/api/v1/student/extra-curricular/offerings/${params.offeringId}/sessions/${params.sessionId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
}
