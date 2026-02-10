import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "student:extra-curricular-session";
const ADMIN_TAG = "admin:extra-curricular-offering";

export async function POST(
  req: NextRequest,
  { params }: { params: { offeringId: string; sessionId: string } }
) {
  const body = await req.json();

  const res = await proxyToBackend(
    req,
    `/api/v1/student/extra-curricular/offerings/${params.offeringId}/sessions/${params.sessionId}/attendance`,
    {
      method: "POST",
      body,
      cache: "no-store",
    }
  );

  if (res.ok) {
    revalidateTag(TAG);
    revalidateTag(ADMIN_TAG);
  }

  return res;
}
