import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:extra-curricular-session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { offeringId: string; sessionId: string } }
) {
  const body = await req.json(); // { targetStatus: "CANCELED" }

  const res = await proxyToBackend(
    req,
    `/api/v1/admin/extra-curricular/offerings/${params.offeringId}/sessions/${params.sessionId}/status`,
    {
      method: "PATCH",
      body,
      cache: "no-store",
    }
  );

  if (res.ok) revalidateTag(TAG);
  return res;
}
