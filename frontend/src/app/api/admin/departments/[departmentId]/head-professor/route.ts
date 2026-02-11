import { proxyToBackend } from "@/lib/bff";

export async function PATCH(req: Request, { params }: { params: { departmentId: string } }) {
    const body = await req.json();
    return proxyToBackend(req, `/api/v1/admin/depts/${params.departmentId}/head-professor`, {
        method: "PATCH",
        body,
    });
}
