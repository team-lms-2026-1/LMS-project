export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/bff";

export async function GET(req: NextRequest) {
    return proxyToBackend(req, "/api/v1/professor/community/notices");
}
