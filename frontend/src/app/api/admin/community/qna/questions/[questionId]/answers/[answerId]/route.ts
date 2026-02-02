import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:questions";

type Ctx = { params: { questionId: string; answerId: string } };

export async function PATCH(req: Request, ctx: Ctx) {
  const { questionId, answerId } = ctx.params;
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(
    req,
    `/api/v1/admin/community/qna/questions/${encodeURIComponent(questionId)}/answers/${encodeURIComponent(answerId)}`,
    {
      method: "PATCH", // 백엔드가 PATCH면 "PATCH"로 바꿔
      forwardQuery: false,
      body,
      cache: "no-store",
    }
  );

  if (res.ok) revalidateTag(TAG);
  return res;
}

export async function DELETE(req: Request, ctx: Ctx) {
  const { questionId, answerId } = ctx.params;

  const res = await proxyToBackend(
    req,
    `/api/v1/admin/community/qna/questions/${encodeURIComponent(questionId)}/answers/${encodeURIComponent(answerId)}`,
    {
      method: "DELETE",
      forwardQuery: false,
      cache: "no-store",
    }
  );

  if (res.ok) revalidateTag(TAG);
  return res;
}
