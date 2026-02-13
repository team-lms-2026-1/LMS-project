import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:diagnoses";
const STUDENT_TAG = "student:diagnoses";

type Ctx = { params: { dignosisId: string } };

export async function GET(req: Request, ctx: Ctx) {
  const dignosisId = ctx.params.dignosisId;
  return proxyToBackend(req, `/api/v1/admin/diagnoses/${encodeURIComponent(dignosisId)}`, {
    method: "GET",
    cache: "no-store",
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const dignosisId = ctx.params.dignosisId;
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, `/api/v1/admin/diagnoses/${encodeURIComponent(dignosisId)}`, {
    method: "PATCH",
    forwardQuery: false,
    body,
    cache: "no-store",
  });

  if (res.ok) {
    revalidateTag(TAG);
    revalidateTag(STUDENT_TAG);
  }

  return res;
}

export async function DELETE(req: Request, ctx: Ctx) {
  const dignosisId = ctx.params.dignosisId;

  const res = await proxyToBackend(req, `/api/v1/admin/diagnoses/${encodeURIComponent(dignosisId)}`, {
    method: "DELETE",
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) {
    revalidateTag(TAG);
    revalidateTag(STUDENT_TAG);
  }

  return res;
}
