import { proxyToBackend } from "@/lib/bff";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    const body = await req.json();
    // 백엔드 관리자 상태 변경 API
    return proxyToBackend(req, `/api/v1/admin/mentoring/applications/${id}/status`, {
        method: "PATCH",
        body
    });
}
