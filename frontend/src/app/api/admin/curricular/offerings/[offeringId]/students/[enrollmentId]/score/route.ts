import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:curricular-offering-student";

export async function PATCH(
  req: Request,
  { params }: { params: { offeringId: string; enrollmentId: string } }
) {
  const body = await req.json();

  const res = await proxyToBackend(
    req,
    `/api/v1/admin/curricular-offerings/${params.offeringId}/students/${params.enrollmentId}/score`,
    {
      method: "PATCH",
      body,
      cache: "no-store",
    }
  );

  if (res.ok) revalidateTag(TAG);

  return res;
}
