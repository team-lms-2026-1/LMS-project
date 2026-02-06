export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/bff";

type RouteParams = {
    params: { resourceId: string };
};

export async function GET(req: NextRequest, { params }: RouteParams) {
    const { resourceId } = params;
    return proxyToBackend(req, `/api/v1/professor/community/resources/${resourceId}`);
}
