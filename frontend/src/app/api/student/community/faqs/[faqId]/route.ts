import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "student:faqs";

type Ctx = { params: { faqId: string } };

export async function GET(req: Request, ctx: Ctx) {
  const faqId = ctx.params.faqId;

  return proxyToBackend(req, `/api/v1/student/community/faqs/${encodeURIComponent(faqId)}`, {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] },
  });
}

export async function PUT(req: Request, ctx: Ctx) {
  const faqId = ctx.params.faqId;
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, `/api/v1/student/community/faqs/${encodeURIComponent(faqId)}`, {
    method: "PUT",
    forwardQuery: false,
    body,
    cache: "no-store",
  });

  if (res.ok) revalidateTag(TAG);
  return res;
}