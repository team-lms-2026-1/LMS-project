import { proxyToBackend } from "@/lib/bff";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/student/extra-curricular/grade-reports/me/list", {
    method: "GET",
    cache: "no-store",
  });
}
