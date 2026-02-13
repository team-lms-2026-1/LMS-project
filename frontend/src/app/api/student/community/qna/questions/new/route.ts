import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "student:questions";
const ADMIN_TAG = "admin:questions";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, "/api/v1/student/community/qna/questions", {
    method: "POST",
    forwardQuery: false,
    body,
    cache: "no-store",
  });

  if (res.ok) {
    revalidateTag(TAG);
    revalidateTag(ADMIN_TAG);
  }
  return res;
}
