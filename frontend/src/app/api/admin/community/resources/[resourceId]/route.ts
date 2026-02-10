import { proxyToBackend, proxyStreamToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:resources";
const STUDENT_TAG = "student:resources";

type Ctx = { params: { resourceId: string } };

export async function GET(req: Request, ctx: Ctx) {
  const resourceId = ctx.params.resourceId;

  return proxyToBackend(req, `/api/v1/admin/community/resources/${encodeURIComponent(resourceId)}`, {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] },
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const resourceId = ctx.params.resourceId;

  const res = await proxyStreamToBackend(req, {
    method: "PATCH",
    upstreamPath: `/api/v1/admin/community/resources/${encodeURIComponent(resourceId)}`,
    forwardQuery: false,
  });

  if (res.ok) {
    revalidateTag(TAG);
    revalidateTag(STUDENT_TAG);
  }
  return res;
}

export async function DELETE(req: Request, ctx: Ctx) {
  const resourceId = ctx.params.resourceId;

  const res = await proxyToBackend(req, `/api/v1/admin/community/resources/${encodeURIComponent(resourceId)}`, {
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
