import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/bff";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return proxyToBackend(request, `/api/v1/mentoring/matchings/${params.id}/chat`);
}
