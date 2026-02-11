import { proxyToBackend } from "@/lib/bff";

export async function DELETE(req: Request, { params }: { params: { departmentId: string; majorId: string } }) {
    return proxyToBackend(req, `/api/v1/admin/depts/${params.departmentId}/majors/${params.majorId}`, {
        method: "DELETE",
    });
}
