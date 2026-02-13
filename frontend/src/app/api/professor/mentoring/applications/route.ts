import { proxyToBackend } from "@/lib/bff";

export async function POST(req: Request) {
    const body = await req.json();
    // User 멘토링 신청
    return proxyToBackend(req, "/api/v1/mentoring/applications", {
        method: "POST",
        body
    });
}
