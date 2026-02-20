import { proxyToBackend } from "@/lib/bff";

const BASE_UPSTREAM = "/api/v1/student/surveys/available";

export async function GET(req: Request) {
    return proxyToBackend(req, BASE_UPSTREAM);
}
