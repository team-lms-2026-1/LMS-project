import { proxyToBackend } from "@/lib/bff";

type Ctx = { params: { dignosisId: string } };

export async function GET(req: Request, ctx: Ctx) {
  const dignosisId = ctx.params.dignosisId;
  return proxyToBackend(
    req,
    `/api/v1/admin/diagnoses/${encodeURIComponent(dignosisId)}/responses/distribution`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
}
