import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:questions";
type Ctx = { params: { questionId: string } };

const upstream = (questionId: string) =>
  `/api/v1/admin/community/qna/questions/${encodeURIComponent(questionId)}/answer`; // ✅ 단수!

export async function POST(req: Request, ctx: Ctx) {
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, upstream(ctx.params.questionId), {
    method: "POST",
    forwardQuery: false,
    body,
    cache: "no-store",
  });

  if (res.ok) revalidateTag(TAG);
  return res;
}

export async function PATCH(req: Request, ctx: Ctx) {
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, upstream(ctx.params.questionId), {
    method: "PATCH", // ✅ 백엔드가 PATCH
    forwardQuery: false,
    body,
    cache: "no-store",
  });

  if (res.ok) revalidateTag(TAG);
  return res;
}

export async function DELETE(req: Request, ctx: Ctx) {
  const res = await proxyToBackend(req, upstream(ctx.params.questionId), {
    method: "DELETE",
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) revalidateTag(TAG);
  return res;
}
