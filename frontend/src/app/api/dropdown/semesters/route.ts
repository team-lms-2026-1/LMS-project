import { proxyToBackend } from "@/lib/bff";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/semesters/dropdown", {
    method: "GET",
    cache: "no-store",
  });
}