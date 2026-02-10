import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const UPSTREAM = "/api/v1/admin/community/faq/categories";

const TAG_CATEGORIES = "admin:faq:categories";
const TAG_FAQ = "admin:faqs";

type Ctx = { params: { categoryId: string } };

function withId(ctx: Ctx) {
  return `${UPSTREAM}/${encodeURIComponent(ctx.params.categoryId)}`;
}

/** 단건 조회 (권장: 태그 캐시 일관성) */
export async function GET(req: Request, ctx: Ctx) {
  return proxyToBackend(req, withId(ctx), {
    method: "GET",
    forwardQuery: true,
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG_CATEGORIES] },
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, withId(ctx), {
    method: "PATCH",
    body,
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) {
    revalidateTag(TAG_CATEGORIES);
    revalidateTag(TAG_FAQ); 
  }
  return res;
}

export async function DELETE(req: Request, ctx: Ctx) {
  const res = await proxyToBackend(req, withId(ctx), {
    method: "DELETE",
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) {
    revalidateTag(TAG_CATEGORIES);
    revalidateTag(TAG_FAQ);
  }
  return res;
}
