export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/bff";

type RouteParams = {
    params: { faqId: string };
};

export async function GET(req: NextRequest, { params }: RouteParams) {
    const { faqId } = params;
    return proxyToBackend(req, `/api/v1/professor/community/faqs/${faqId}`);
}
