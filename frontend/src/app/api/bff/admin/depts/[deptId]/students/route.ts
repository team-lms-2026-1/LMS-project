import { proxyToBackend } from "@/lib//bff";
import type { NextRequest } from "next/server";

type Params = { params: { deptId: string } };

export async function GET(req: NextRequest, { params }: Params) {
  const { deptId } = params;

  return proxyToBackend(
    req,
    `/api/v1/admin/depts/${deptId}/students`,
    {
      method: "GET",
    }
  );
}
