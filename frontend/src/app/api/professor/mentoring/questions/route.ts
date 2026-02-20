import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/bff";

export async function POST(request: NextRequest) {
    const body = await request.json();
    return proxyToBackend(request, "/api/v1/mentoring/questions", {
        method: "POST",
        body
    });
}
