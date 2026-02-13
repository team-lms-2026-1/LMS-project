import { proxyToBackend } from "@/lib/bff";

export async function POST(req: Request) {
  const body = await req.json();

  return proxyToBackend(req, "/api/v1/student/mbti/recommendations", {
    method: "POST",
    forwardQuery: false,
    body,
    cache: "no-store",
  });
}
