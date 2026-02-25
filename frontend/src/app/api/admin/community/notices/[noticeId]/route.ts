import { proxyToBackend, proxyStreamToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:notices";
const STUDENT_TAG = "student:notices";

type Ctx = { params: { noticeId: string } };

export async function GET(req: Request, ctx: Ctx) {
  const noticeId = ctx.params.noticeId;

  const res = await proxyToBackend(req, `/api/v1/admin/community/notices/${encodeURIComponent(noticeId)}`, {
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
  const noticeId = ctx.params.noticeId;

  const res = await proxyStreamToBackend(req, {
    method: "PATCH",
    upstreamPath: `/api/v1/admin/community/notices/${encodeURIComponent(noticeId)}`,
    forwardQuery: false,
  });

  if (res.ok) {
    revalidateTag(TAG);
    revalidateTag(STUDENT_TAG);
  }
  return res;
}

export async function DELETE(req: Request, ctx: Ctx) {
  const noticeId = ctx.params.noticeId;

  const res = await proxyToBackend(req, `/api/v1/admin/community/notices/${encodeURIComponent(noticeId)}`, {
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
