import { proxyToBackend } from "@/lib/bff";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 
 * 목록 조회 
 * GET /api/admin/study-space/spaces-rentals?page=1&size=10&keyword=...
 * -> Backend: /api/v1/admin/spaces-rentals
 */
export async function GET(req: Request) {
    const upstream = `/api/v1/admin/spaces-rentals`;

    return proxyToBackend(req, upstream, {
        method: "GET",
        forwardQuery: true, // 쿼리 파라미터 전달
        cache: "no-store",
    });
}
