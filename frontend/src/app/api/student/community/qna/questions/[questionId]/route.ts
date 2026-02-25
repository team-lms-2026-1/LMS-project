import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "student:questions";
const ADMIN_TAG = "admin:questions";

type Ctx = { params: { questionId: string } };

export async function GET(req: Request, ctx: Ctx) {
  const questionId = ctx.params.questionId;

  const res = await proxyToBackend(req, `/api/v1/student/community/qna/questions/${encodeURIComponent(questionId)}`, {
    method: "GET",
    cache: "no-store",
  });

  if (res.ok) {
    revalidateTag(TAG);
    revalidateTag(ADMIN_TAG);
  }
  return res;
}

export async function PUT(req: Request, ctx: Ctx) {
  const questionId = ctx.params.questionId;
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, `/api/v1/student/community/qna/questions/${encodeURIComponent(questionId)}`, {
    method: "PUT",
    forwardQuery: false,
    body,
    cache: "no-store",
  });

  if (res.ok) {
    revalidateTag(TAG);
    revalidateTag(ADMIN_TAG);
  }
  return res;
}

export async function DELETE(req: Request, ctx: Ctx) {
  const questionId = ctx.params.questionId;

  const res = await proxyToBackend(req, `/api/v1/student/community/qna/questions/${encodeURIComponent(questionId)}`, {
    method: "DELETE",
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) {
    revalidateTag(TAG);
    revalidateTag(ADMIN_TAG);
  }
  return res;
}
