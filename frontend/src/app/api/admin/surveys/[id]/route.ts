import { proxyToBackend } from "@/lib/bff";

const BASE_UPSTREAM = "/api/v1/admin/surveys";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    return proxyToBackend(req, `${BASE_UPSTREAM}/${id}`);
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const body = await req.json();
    return proxyToBackend(req, `${BASE_UPSTREAM}/${id}`, { method: "PATCH", body });
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    return proxyToBackend(req, `${BASE_UPSTREAM}/${id}`, { method: "DELETE" });
}
