import { proxyToBackend } from "@/lib/bff";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { spaceId: string } };

const TAG = (spaceId: string) => `student:spaces:detail:${spaceId}`;

function backendPath(ctx: Ctx) {
  return `/api/v1/student/spaces/${encodeURIComponent(ctx.params.spaceId)}`;
}

export async function GET(req: Request, ctx: Ctx) {
  const spaceId = ctx.params.spaceId;

  return proxyToBackend(req, backendPath(ctx), {
    method: "GET",
    forwardQuery: true,
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG(spaceId)] },
  });
}
