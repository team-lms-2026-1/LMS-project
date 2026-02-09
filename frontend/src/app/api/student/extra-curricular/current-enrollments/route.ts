import { proxyToBackend } from "@/lib/bff";

const TAG = "student:extra-curricular-offering";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/student/extra-curriculars/current-enrollments", {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] },
  });
}
