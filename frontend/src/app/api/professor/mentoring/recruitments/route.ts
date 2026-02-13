import { proxyToBackend } from "@/lib/bff";

export async function GET(req: Request) {
    // User/Admin 공용 모집 공고 목록 조회
    return proxyToBackend(req, "/api/v1/mentoring/recruitments");
}
