import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TAG = "admin:spaces-rentals";
const STUDENT_TAG = "student:rentals";

type Ctx = { params: { rentalId: string } };

export async function PATCH(req: Request, ctx: Ctx) {
  const id = encodeURIComponent(ctx.params.rentalId);
  const upstream = `/api/v1/admin/spaces-rentals/${id}`;

  // ✅ 핵심: PATCH 바디를 읽어서 전달
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, upstream, {
    method: "PATCH",
    body,
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.status >= 200 && res.status < 300) {
    revalidateTag(TAG);
    revalidateTag(STUDENT_TAG);
  }
  return res;
}
