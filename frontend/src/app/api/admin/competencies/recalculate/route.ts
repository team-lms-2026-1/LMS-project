import { proxyToBackend } from "@/lib/bff";

export async function POST(req: Request) {
  return proxyToBackend(req, "/api/v1/admin/competencies/recalculate", {
    method: "POST",
    cache: "no-store",
  });
}
