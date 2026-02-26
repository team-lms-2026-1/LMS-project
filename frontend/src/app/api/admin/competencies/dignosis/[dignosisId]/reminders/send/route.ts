import { proxyToBackend } from "@/lib/bff";

type Ctx = { params: { dignosisId: string } };

export async function POST(req: Request, ctx: Ctx) {
  const dignosisId = ctx.params.dignosisId;
  const body = await req.json().catch(() => null);
  return proxyToBackend(req, `/api/v1/admin/diagnoses/${encodeURIComponent(dignosisId)}/reminders/send`, {
    method: "POST",
    cache: "no-store",
    body,
  });
}
