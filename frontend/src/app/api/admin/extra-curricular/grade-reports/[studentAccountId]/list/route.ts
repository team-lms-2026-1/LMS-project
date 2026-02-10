import { proxyToBackend } from "@/lib/bff";

const TAG = "admin:extra-curricular-grade-reports-detail";

export async function GET(
  req: Request,
  { params }: { params: { studentAccountId: string } }
) {
  return proxyToBackend(
    req,
    `/api/v1/admin/extra-curricular/grade-reports/${params.studentAccountId}/list`,
    {
      method: "GET",
      cache: "force-cache",
      next: { revalidate: 600, tags: [TAG] },
    }
  );
}
