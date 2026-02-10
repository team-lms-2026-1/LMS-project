import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:depts";

export async function GET(req: Request) {
  // bff.ts proxyToBackend defaults cache to 'force-cache', which conflicts with revalidate.
  // Manually fetch to avoid touching shared code.
  const base =
    process.env.API_BASE_URL ??
    process.env.ADMIN_API_BASE_URL ??
    "http://localhost:8080";

  const { cookies } = await import("next/headers");
  const token = cookies().get("access_token")?.value;

  // ✅ 프론트에서 온 쿼리스트링(page, size, keyword 등) 그대로 가져오기
  const url = new URL(req.url);
  const qs = url.search; // 예: "?page=1&size=10&keyword=컴공" 또는 "" (없으면 빈 문자열)

  const res = await fetch(`${base}/api/v1/admin/depts${qs}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: 600, tags: [TAG] },
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}

// ✅ 학과 생성용 POST 추가 (기존 기능 안 건드리고 밑에만 추가)
export async function POST(req: Request) {
  const base =
    process.env.API_BASE_URL ??
    process.env.ADMIN_API_BASE_URL ??
    "http://localhost:8080";

  const { cookies } = await import("next/headers");
  const token = cookies().get("access_token")?.value;

  // 프론트에서 넘어온 body 그대로 backend로 전달
  const body = await req.json();

  const res = await fetch(`${base}/api/v1/admin/depts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  // 생성 성공 시 목록 캐시 태그 재검증
  if (res.ok) {
    await revalidateTag(TAG);
  }

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
