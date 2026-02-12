import { proxyToBackend } from "@/lib/bff";

const TAG = "student:mbti-interest-keywords";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/student/mbti/interest-keywords", {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] },
  });
}

