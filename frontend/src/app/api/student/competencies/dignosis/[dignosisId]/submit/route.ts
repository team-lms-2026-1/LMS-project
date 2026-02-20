import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "student:diagnoses";

type Ctx = { params: { dignosisId: string } };

export async function POST(req: Request, ctx: Ctx) {
  const dignosisId = ctx.params.dignosisId;
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, `/api/v1/student/diagnoses/${encodeURIComponent(dignosisId)}/submit`, {
    method: "POST",
    forwardQuery: false,
    body,
    cache: "no-store",
  });

  if (res.ok) revalidateTag(TAG);

  return res;
}
