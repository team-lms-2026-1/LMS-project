import { proxyToBackend } from "@/lib/bff";

export async function GET(req: Request, { params }: { params: { departmentId: string; majorId: string } }) {
    return proxyToBackend(req, `/api/v1/admin/depts/${params.departmentId}/majors/${params.majorId}/edit`);
}

export async function PATCH(req: Request, { params }: { params: { departmentId: string; majorId: string } }) {
    const body = await req.json();
    return proxyToBackend(req, `/api/v1/admin/depts/${params.departmentId}/majors/${params.majorId}/edit`, {
        method: "PATCH",
        body,
    });
}
