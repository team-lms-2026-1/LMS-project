import { proxyToBackend } from "@/lib/bff";

const TAG = "dropdown:deptProfessors";

export async function GET(req: Request, { params }: {params: { id: string }}) {
  return proxyToBackend(req, `/api/v1/depts/${params.id}/professors/dropdown`, {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] },
  });
}