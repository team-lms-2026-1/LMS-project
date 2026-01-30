import { proxyToBackend, proxyStreamToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:notices";

// ✅ Next route params는 string
type Ctx = { params: { noticeId: string } };

export async function GET(req: Request, ctx: Ctx) {
  const noticeId = ctx.params.noticeId;

  return proxyToBackend(req, `/api/v1/admin/community/notices/${encodeURIComponent(noticeId)}`, {
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
  const noticeId = ctx.params.noticeId;

  const res = await proxyStreamToBackend(req, {
    method: "PATCH",
    upstreamPath: `/api/v1/admin/community/notices/${encodeURIComponent(noticeId)}`,
    forwardQuery: false,
  });

  if (res.ok) revalidateTag(TAG);
  return res;
}

/**
 * ✅ 삭제 엔드포인트가 student로 되어있어서 100% 문제
 * admin 삭제는 admin 경로로 보내야 함
 */
export async function DELETE(req: Request, ctx: Ctx) {
  const noticeId = ctx.params.noticeId;

  const res = await proxyToBackend(req, `/api/v1/admin/community/notices/${encodeURIComponent(noticeId)}`, {
    method: "DELETE",
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) revalidateTag(TAG);
  return res;
}
