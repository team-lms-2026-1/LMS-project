import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export async function POST(
  req: Request,
  { params }: { params: { offeringId: string } }
) {
  const res = await proxyToBackend(
    req,
    `/api/v1/student/extra-curriculars/${params.offeringId}/enroll`,
    {
      method: "POST",
      forwardQuery: false,
      cache: "no-store",
    }
  );

  if (res.ok) {
    revalidateTag("student:extra-curricular-offering");
    revalidateTag("admin:extra-curricular-offering");
  }

  return res;
}
