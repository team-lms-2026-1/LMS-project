import { proxyToBackend } from "@/lib/bff";

type Ctx = { params: { studentId: string } };

export async function GET(req: Request, ctx: Ctx) {
  const studentId = ctx.params.studentId;
  return proxyToBackend(req, `/api/v1/admin/competencies/students/${encodeURIComponent(studentId)}/dashboard`, {
    method: "GET",
    cache: "no-store",
  });
}
