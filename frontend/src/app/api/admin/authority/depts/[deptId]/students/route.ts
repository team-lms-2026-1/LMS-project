import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:depts";

export async function GET(
  req: Request,
  { params }: { params: { deptId: string } }
) {
  const { deptId } = params;

  return proxyToBackend(req, `/api/v1/admin/depts/${deptId}/students`, {
    method: "GET",
    cache: "no-store",
    forwardQuery: true, // 👈 ?page=2&size=20 그대로 백엔드로 전달
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
    `/api/v1/admin/depts/${deptId}/students`,
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
