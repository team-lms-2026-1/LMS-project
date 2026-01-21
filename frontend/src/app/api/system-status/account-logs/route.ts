import { proxyToBackend } from "@/lib/bff";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/admin/user-activity");
}
