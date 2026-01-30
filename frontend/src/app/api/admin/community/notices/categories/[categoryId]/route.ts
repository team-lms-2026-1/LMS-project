import { proxyToBackend } from "@/lib/bff";

// ✅ 백엔드 실제 엔드포인트로 맞추세요
// 예: "/api/v1/admin/community/notice-categories" 일 수도 있고
// 현재 사용자 코드 기준: notices/categories
const BACKEND_BASE = "/api/v1/admin/community/notices/categories";

type Ctx = { params: { categoryId: string } };

function withId(ctx: Ctx) {
  return `${BACKEND_BASE}/${encodeURIComponent(ctx.params.categoryId)}`;
}

/** 단건 조회 */
export async function GET(req: Request, ctx: Ctx) {
  return proxyToBackend(req, withId(ctx), { method: "GET", forwardQuery: true });
}

// /** 단건 수정 - 백엔드가 PUT이면 PUT만 사용 */
// export async function PUT(req: Request, ctx: Ctx) {
//   const body = await req.json().catch(() => null);
//   return proxyToBackend(req, withId(ctx), { method: "PUT", body, forwardQuery: false });
// }

/** 단건 부분 수정 - 백엔드가 PATCH를 지원하면 사용 */
export async function PATCH(req: Request, ctx: Ctx) {
  const body = await req.json().catch(() => null);
  return proxyToBackend(req, withId(ctx), { method: "PATCH", body, forwardQuery: false });
}

/** ✅ 단건 삭제 */
export async function DELETE(req: Request, ctx: Ctx) {
  return proxyToBackend(req, withId(ctx), { method: "DELETE", forwardQuery: false });
}
