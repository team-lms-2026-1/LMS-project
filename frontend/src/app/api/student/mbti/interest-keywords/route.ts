import { proxyToBackend } from "@/lib/bff";

const TAG = "student:mbti-interest-keywords";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/student/mbti/interest-keywords", {
    method: "GET",
    // Locale-sensitive — don't serve cached responses that ignore Accept-Language
    cache: "no-store",
    next: { revalidate: 600, tags: [TAG] },
  });
}

