import { proxyToBackend } from "@/lib/bff";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/professor/curricular-offerings", {
    method: "GET",
    cache: "no-store",
  });
}
