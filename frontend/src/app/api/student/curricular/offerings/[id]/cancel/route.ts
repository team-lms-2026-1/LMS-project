import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "student:curricular-offering";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const res = await proxyToBackend(req, `/api/v1/student/curriculars/${params.id}/cancel`, {
    method: "POST",
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) {
    revalidateTag("student:curricular-offering");
    revalidateTag("admin:curricular-offering");
  }
  return res;
}