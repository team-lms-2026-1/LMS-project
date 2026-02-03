import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "student:questions";

type Ctx = { params: { questionId: string } };

/**
 * ✅ 수정 전용 엔드포인트 (/edit)
 * - 프론트: /api/student/community/qna/questions/{id}/edit 로 PATCH 호출
 * - 백엔드: /api/v1/student/community/qna/questions/{id} 로 PATCH 프록시
 */
export async function PATCH(req: Request, ctx: Ctx) {
  const questionId = ctx.params.questionId;
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(
    req,
    `/api/v1/student/community/qna/questions/${encodeURIComponent(questionId)}`,
    {
      method: "PATCH",
      forwardQuery: false,
      body,
      cache: "no-store",
    }
  );

  if (res.ok) revalidateTag(TAG);
  return res;
}
