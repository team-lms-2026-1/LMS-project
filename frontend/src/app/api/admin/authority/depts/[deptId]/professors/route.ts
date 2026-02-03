import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:depts";

export async function GET(
  req: Request,
  { params }: { params: { deptId: string } }
) {
  const { deptId } = params;

  return proxyToBackend(req, `/api/v1/admin/depts/${deptId}/professors`, {
    method: "GET",
    cache: "no-store",
    // 쿼리스트링(page, size 같은 거)이 있으면 같이 넘기고 싶으면:
    forwardQuery: true,
    next: { tags: [TAG] },
  });
}

export async function POST(
  req: Request,
  { params }: { params: { deptId: string } }
) {
  const { deptId } = params;
  const body = await req.json();

  const res = await proxyToBackend(
    req,
    `/api/v1/admin/depts/${deptId}/professors`,
    {
      method: "POST",
      body,
      forwardQuery: false,
      cache: "no-store",
    }
  );

  if (res.ok) revalidateTag(TAG);

  return res;
}
