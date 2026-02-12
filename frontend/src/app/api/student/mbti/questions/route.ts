import { proxyToBackend } from "@/lib/bff";
// import { revalidateTag } from "next/cache";

const TAG = "student:mbti-questions";

export async function GET(req: Request) {
    return proxyToBackend(req, "/api/v1/student/mbti/questions", {
        method: "GET",
        cache: "force-cache",
        next: { revalidate: 600, tags: [TAG] }
    });
}