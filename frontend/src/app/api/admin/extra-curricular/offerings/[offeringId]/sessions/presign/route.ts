import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/bff";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ offeringId: string }> }
) {
  const { offeringId } = await ctx.params;

  const body = await req.json();

  return proxyToBackend(
    req,
    `/api/v1/admin/extra-curricular/offerings/${offeringId}/sessions/presign`,
    {
      method: "POST",
      body,
      cache: "no-store",
    }
  );
}
