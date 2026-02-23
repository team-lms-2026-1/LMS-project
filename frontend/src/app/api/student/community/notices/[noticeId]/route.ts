import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "student:notices";

type Ctx = { params: { noticeId: string } };

export async function GET(req: Request, ctx: Ctx) {
  const noticeId = ctx.params.noticeId;

  return proxyToBackend(req, `/api/v1/student/community/notices/${encodeURIComponent(noticeId)}`, {
    method: "GET",
    next: { revalidate: 600, tags: [TAG] },
  });
}

export async function PUT(req: Request, ctx: Ctx) {
  const noticeId = ctx.params.noticeId;
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, `/api/v1/student/community/notices/${encodeURIComponent(noticeId)}`, {
    method: "PUT",
    forwardQuery: false,
    body,
    cache: "no-store",
  });

  if (res.ok) revalidateTag(TAG);
  return res;
}
