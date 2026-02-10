import { proxyToBackend } from "@/lib/bff";

const BASE_UPSTREAM = "/api/v1/student/surveys";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    return proxyToBackend(req, `${BASE_UPSTREAM}/${id}`);
}
