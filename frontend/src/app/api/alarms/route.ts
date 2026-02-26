import { proxyToBackend } from "@/lib/bff";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/alarms", {
    method: "GET",
    cache: "no-store",
  });
}

export async function DELETE(req: Request) {
  return proxyToBackend(req, "/api/v1/alarms", {
    method: "DELETE",
    cache: "no-store",
  });
}
