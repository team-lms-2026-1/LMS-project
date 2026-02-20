import { proxyToBackend } from "@/lib/bff";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { departmentId: string } }) {
    return proxyToBackend(req, `/api/v1/admin/depts/${params.departmentId}/edit`);
}

export async function PATCH(req: Request, { params }: { params: { departmentId: string } }) {
    const body = await req.json();
    return proxyToBackend(req, `/api/v1/admin/depts/${params.departmentId}/edit`, {
        method: "PATCH",
        body,
    });
}
