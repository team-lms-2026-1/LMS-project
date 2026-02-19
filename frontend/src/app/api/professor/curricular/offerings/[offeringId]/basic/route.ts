import { proxyToBackend } from "@/lib/bff";

type RouteParams = {
  params: { offeringId: string };
};

export async function GET(req: Request, { params }: RouteParams) {
  return proxyToBackend(req, `/api/v1/professor/curricular-offerings/${params.offeringId}`, {
    method: "GET",
    cache: "no-store",
  });
}
