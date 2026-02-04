import { proxyStreamToBackend } from "@/lib/bff";

export async function POST(req: Request) {
    return proxyStreamToBackend(req, {
        method: "POST",
        upstreamPath: "/api/v1/admin/logs/export"
    });
}
