import { proxyToBackend } from "@/lib/bff";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/alarms/unread-count", {
    method: "GET",
    cache: "no-store",
  });
}
