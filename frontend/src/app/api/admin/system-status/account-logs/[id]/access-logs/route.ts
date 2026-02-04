import { proxyToBackend } from "@/lib/bff";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    return proxyToBackend(req, `/api/v1/admin/user-activity/${id}/access-logs`);
}
