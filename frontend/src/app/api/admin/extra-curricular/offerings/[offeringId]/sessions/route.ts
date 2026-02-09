import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:extra-curricular-session"

export async function GET(req: Request, { params }: {params: { offeringId: string }}) {
  return proxyToBackend(req, `/api/v1/admin/extra-curricular/offerings/${params.offeringId}/sessions`, {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG]}
  });
}


export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ offeringId: string }> }
) {
  const { offeringId } = await ctx.params;
  const body = await req.json();

  const res = await proxyToBackend(
    req,
    `/api/v1/admin/extra-curricular/offerings/${offeringId}/sessions`,
    {
      method: "POST",
      body,
      cache: "no-store",
    }
  );
  if (res.ok) revalidateTag(TAG);

  return res;
}
