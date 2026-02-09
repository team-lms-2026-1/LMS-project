import { proxyToBackend } from "@/lib/bff";

const TAG = "admin:extra-curricular-offering";

export async function GET(req: Request, { params }: {params: { offeringId: string }}) {
  return proxyToBackend(req, `/api/v1/admin/extra-curricular/offerings/${params.offeringId}/applications`, {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] }
  });
}
