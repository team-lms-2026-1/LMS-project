import { proxyToBackend } from "@/lib/bff";

export async function PATCH(req: Request) {
  return proxyToBackend(req, "/api/v1/alarms/read-all", {
    method: "PATCH",
    forwardQuery: false,
    cache: "no-store",
  });
}
