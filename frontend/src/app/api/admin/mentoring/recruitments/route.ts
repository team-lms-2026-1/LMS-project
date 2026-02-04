import { proxyToBackend } from "@/lib/bff";

export async function GET(req: Request) {
    // 백엔드 공용 조회 API
    return proxyToBackend(req, "/api/v1/mentoring/recruitments");
}

export async function POST(req: Request) {
    const body = await req.json();
    // 백엔드 관리자 생성 API
    return proxyToBackend(req, "/api/v1/admin/mentoring/recruitments", {
        method: "POST",
        body
    });
}
