import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:extra-curricular-session";
const STUDENT_TAG = "student:extra-curricular-session";

export async function GET(
  req: Request,
  { params }: { params: { offeringId: string; sessionId: string } }
) {
  return proxyToBackend(
    req,
    `/api/v1/admin/extra-curricular/offerings/${params.offeringId}/sessions/${params.sessionId}`,
    {
      method: "GET",
      cache: "force-cache",
      next: { revalidate: 600, tags: [TAG] },
    }
  );
}


export async function PATCH(
  req: NextRequest,
  { params }: { params: { offeringId: string; sessionId: string } }
) {
  const body = await req.json();

  const res = await proxyToBackend(
    req,
    `/api/v1/admin/extra-curricular/offerings/${params.offeringId}/sessions/${params.sessionId}`,
    {
      method: "PATCH",
      body,
      cache: "no-store",
    }
  );

  if (res.ok) {
    revalidateTag(TAG);
    revalidateTag(STUDENT_TAG);
  }
  return res;
}
