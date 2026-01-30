import { proxyStreamToBackend } from "@/lib/bff";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { attachmentId: string } };

// ✅ 백엔드 실제 다운로드 엔드포인트로 바꾸세요.
// 예시1) /api/v1/admin/attachments/{id}/download
// 예시2) /api/v1/admin/community/attachments/{id}/download
const UPSTREAM_BASE = "/api/v1/admin/attachments";

export async function GET(req: Request, ctx: Ctx) {
  const id = encodeURIComponent(ctx.params.attachmentId);
  const upstreamPath = `${UPSTREAM_BASE}/${id}/download`;

  return proxyStreamToBackend(req, {
    method: "GET",
    upstreamPath,
    forwardQuery: false,
  });
}
