import { proxyToBackend } from "@/lib/bff";

const TAG = "student:extra-curricular-session";

export async function GET(req: Request, { params }: { params: { offeringId: string } }) {
  return proxyToBackend(req, `/api/v1/student/extra-curricular/offerings/${params.offeringId}/sessions`, {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] },
  });
}
