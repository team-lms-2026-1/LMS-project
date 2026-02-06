import { proxyToBackend } from "@/lib/bff";

const BASE_UPSTREAM = "/api/v1/student/surveys/submit";

export async function POST(req: Request) {
    const body = await req.json();
    return proxyToBackend(req, BASE_UPSTREAM, { method: "POST", body });
}
