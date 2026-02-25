import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "student:resources";
const ADMIN_TAG = "admin:resources";

type Ctx = { params: { resourceId: string } };

export async function GET(req: Request, ctx: Ctx) {
  const resourceId = ctx.params.resourceId;

  const res = await proxyToBackend(req, `/api/v1/student/community/resources/${encodeURIComponent(resourceId)}`, {
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
  const resourceId = ctx.params.resourceId;
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, `/api/v1/student/community/resources/${encodeURIComponent(resourceId)}`, {
    method: "PUT",
    forwardQuery: false,
    body,
    cache: "no-store",
  });

  if (res.ok) revalidateTag(TAG);
  return res;
}
