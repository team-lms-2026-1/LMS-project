import { proxyToBackendPublic } from "@/lib/bff";

export async function POST(req: Request) {
    return proxyToBackendPublic(req, "/api/v1/auth/password-reset/request", {
        method: "POST",
    });
}
