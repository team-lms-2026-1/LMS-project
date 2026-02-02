import { proxyStreamToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:notices";

export async function POST(req: Request) {
  const res = await proxyStreamToBackend(req, {
    method: "POST",
    upstreamPath: "/api/v1/admin/community/notices",
    forwardQuery: false,
  });

  if (res.ok) revalidateTag(TAG);
  return res;
}
