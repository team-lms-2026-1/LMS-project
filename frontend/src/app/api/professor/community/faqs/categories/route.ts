export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/bff";

const BACKEND_PATH = "/api/v1/professor/community/faq/categories";

export async function GET(req: NextRequest) {
  return proxyToBackend(req, BACKEND_PATH);
}
