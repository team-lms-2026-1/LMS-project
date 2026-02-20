import { proxyToBackend } from "@/lib/bff";

export async function GET(req: Request, { params }: { params: { departmentId: string } }) {
    return proxyToBackend(req, `/api/v1/admin/depts/${params.departmentId}/majors`);
}

export async function POST(req: Request, { params }: { params: { departmentId: string } }) {
    const body = await req.json();
    return proxyToBackend(req, `/api/v1/admin/depts/${params.departmentId}/majors`, {
        method: "POST",
        body,
    });
}
