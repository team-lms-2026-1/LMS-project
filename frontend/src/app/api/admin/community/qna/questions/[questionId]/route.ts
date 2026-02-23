// src/app/api/admin/community/qna/questions/[questionId]/route.ts
import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:questions";
const STUDENT_TAG = "student:questions";
type Ctx = { params: { questionId: string } };

export async function GET(req: Request, ctx: Ctx) {
  const { questionId } = ctx.params;
  const res = await proxyToBackend(req, `/api/v1/admin/community/qna/questions/${encodeURIComponent(questionId)}`, {
    method: "GET",
    cache: "no-store",
  });

  if (res.ok) {
    revalidateTag(TAG);
    revalidateTag(STUDENT_TAG);
  }
  return res;
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { questionId } = ctx.params;
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, `/api/v1/admin/community/qna/questions/${encodeURIComponent(questionId)}`, {
    method: "PATCH",
    forwardQuery: false,
    body,
    cache: "no-store",
  });

  if (res.ok) revalidateTag(TAG);
  return res;
}

export async function DELETE(req: Request, ctx: Ctx) {
  const { questionId } = ctx.params;

  const res = await proxyToBackend(req, `/api/v1/admin/community/qna/questions/${encodeURIComponent(questionId)}`, {
    method: "DELETE",
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) revalidateTag(TAG);
  return res;
}
