import { proxyToBackend } from "@/lib/bff";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    // 백엔드 관리자 신청 목록 조회 API
    return proxyToBackend(req, `/api/v1/admin/mentoring/recruitments/${id}/applications`);
}
