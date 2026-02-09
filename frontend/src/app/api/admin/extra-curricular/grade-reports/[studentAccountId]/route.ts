import { proxyToBackend } from "@/lib/bff";

export async function GET(
  req: Request,
  { params }: { params: { studentAccountId: string } }
) {
  return proxyToBackend(
    req,
    `/api/v1/admin/extra-curricular/grade-reports/${params.studentAccountId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
}
