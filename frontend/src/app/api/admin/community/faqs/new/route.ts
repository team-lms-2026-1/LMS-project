import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:faqs";

export async function POST(req: Request) {
  const body = await req.json();

  const res = await proxyToBackend(req, "/api/v1/student/community/faqs", {
    method: "POST",
    forwardQuery: false,
    body,
    cache: "no-store"
  });

  if (res.ok) revalidateTag(TAG);

  return res;
}
