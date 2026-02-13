import { proxyToBackend,proxyStreamToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:faqs";
const STUDENT_TAG = "student:faqs";

// ✅ Next route params는 string
type Ctx = { params: { faqId: string } };

export async function GET(req: Request, ctx: Ctx) {
  const faqId = ctx.params.faqId;

  return proxyToBackend(req, `/api/v1/admin/community/faqs/${encodeURIComponent(faqId)}`, {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] },
  });
}

/**
 * ✅ 수정도 multipart/form-data로 들어오는 경우가 많음
 * - 프론트에서 FormData로 (request JSON + files) 보내면 그대로 업스트림으로 전달
 * - 파일 수정이 없는 경우에도 FormData로 보내도 문제 없음(백엔드가 request만 받아도 OK)
 */
export async function PATCH(req: Request, ctx: Ctx) {
  const faqId = ctx.params.faqId;
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, `/api/v1/admin/community/faqs/${encodeURIComponent(faqId)}`, {
    method: "PATCH",
    body,
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) {
    revalidateTag(TAG);
    revalidateTag(STUDENT_TAG);
  }
  return res;
}


/**
 * ✅ 삭제 엔드포인트가 student로 되어있어서 100% 문제
 * admin 삭제는 admin 경로로 보내야 함
 */
export async function DELETE(req: Request, ctx: Ctx) {
  const faqId = ctx.params.faqId;

  const res = await proxyToBackend(req, `/api/v1/admin/community/faqs/${encodeURIComponent(faqId)}`, {
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
