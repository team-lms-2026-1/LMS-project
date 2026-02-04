import { proxyToBackend } from "@/lib/bff";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/student/curricular/grade-reports/me", { 
    method: "GET",
    cache: "no-store",
  });
}