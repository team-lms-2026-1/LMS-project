import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_BASE = "/api/v1/student/spaces-rentals";
const TAG = "student:rentals";

type Ctx = { params: { rentalId: string } };

export async function PATCH(req: Request, ctx: Ctx) {
  const rentalId = ctx.params.rentalId;

  const res = await proxyToBackend(
    req,
    `${BACKEND_BASE}/${encodeURIComponent(rentalId)}/cancel`,
    {
      method: "PATCH",
      forwardQuery: false,
      cache: "no-store",
    }
  );

  if (res.status >= 200 && res.status < 300) revalidateTag(TAG);
  return res;
}
