export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/bff";

export async function POST(req: NextRequest) {
    const body = await req.json();
    return proxyToBackend(req, "/api/v1/admin/mentoring/match", {
        method: "POST",
        body
    });
}
