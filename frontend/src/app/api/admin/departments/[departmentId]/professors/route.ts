import { proxyToBackend } from "@/lib/bff";

export async function GET(req: Request, { params }: { params: { departmentId: string } }) {
    return proxyToBackend(req, `/api/v1/admin/depts/${params.departmentId}/professors`);
}
