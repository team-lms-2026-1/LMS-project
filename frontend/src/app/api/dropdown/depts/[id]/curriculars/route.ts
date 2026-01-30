import { proxyToBackend } from "@/lib/bff";

const TAG = "dropdown:deptCurriculars";

export async function GET(req: Request, { params }: {params: { id: string }}) {
  return proxyToBackend(req, `/api/v1/depts/${params.id}/curriculars/dropdown`, {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] },
  });
}