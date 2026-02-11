import { proxyToBackend } from "@/lib/bff";

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
    const path = params.path.join("/");
    // /api/student/mbti/[...path] -> /api/v1/student/mbti/[...path]
    return proxyToBackend(req, `/api/v1/student/mbti/${path}`, {
        method: "GET",
        cache: "no-store", // MBTI results/questions might need fresh data or specific cache strategy
    });
}

export async function POST(req: Request, { params }: { params: { path: string[] } }) {
    const path = params.path.join("/");
    const body = await req.json();

    return proxyToBackend(req, `/api/v1/student/mbti/${path}`, {
        method: "POST",
        body,
        cache: "no-store"
    });
}
