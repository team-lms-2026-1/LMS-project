import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "student:qna:categories";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/student/community/qna/categories", {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] },
    forwardQuery: true,
  });
}

// ✅ 카테고리 등록/수정/삭제가 학생 화면에 필요 없으면 아래는 지워도 됨.
// 혹시 추후 확장 대비로 동일 형식으로 넣어둠.

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, "/api/v1/student/community/qna/categories", {
    method: "POST",
    forwardQuery: false,
    body,
    cache: "no-store",
  });

  if (res.ok) revalidateTag(TAG);
  return res;
}
