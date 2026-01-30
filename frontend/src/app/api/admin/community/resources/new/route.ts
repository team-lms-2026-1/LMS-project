import { proxyStreamToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:resources";

export async function POST(req: Request) {
  // ✅ multipart/form-data 그대로 스트리밍 프록시
  const res = await proxyStreamToBackend(req, {
    method: "POST",
    upstreamPath: "/api/v1/admin/community/resources",
    forwardQuery: false,
  });

  if (res.ok) revalidateTag(TAG);
  return res;
}
