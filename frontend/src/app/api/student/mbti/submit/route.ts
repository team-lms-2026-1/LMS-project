import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "student:mbti-questions";

export async function POST(req: Request) {
    const body = await req.json();

    const res = await proxyToBackend(req, "/api/v1/student/mbti/submit", {
        method: "POST",
        forwardQuery: false,
        body,
        cache: "no-store"
    });

    if (res.ok) revalidateTag(TAG);

    return res;
}
