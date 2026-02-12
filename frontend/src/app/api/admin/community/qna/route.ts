import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:questions";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/admin/community/qna/questions", {
    method: "GET",
    forwardQuery: true,
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] },
  });
}
