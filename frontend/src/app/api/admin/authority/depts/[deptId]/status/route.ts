// app/api/admin/authority/depts/[deptId]/status/route.ts

import { revalidateTag } from "next/cache";

const TAG = "admin:depts";

export async function PATCH(
    req: Request,
    { params }: { params: { deptId: string } }
) {
    const { deptId } = params;

    // 프론트에서 온 body(JSON 문자열)를 그대로 가져온다
    const body = await req.text();

    const base =
        process.env.API_BASE_URL ??
        process.env.ADMIN_API_BASE_URL ??
        "http://localhost:8080";

    const { cookies } = await import("next/headers");
    const token = cookies().get("access_token")?.value;

    const res = await fetch(`${base}/api/v1/admin/depts/${deptId}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body, // 프론트에서 받은 JSON 문자열 그대로 전달
        cache: "no-store",
    });

    let data: any = null;
    try {
        data = await res.json();
    } catch {
        // 응답 바디가 없으면 그냥 무시
        data = null;
    }

    if (res.ok) {
        revalidateTag(TAG);
    }

    // 백엔드가 409, 500 뭐 주든 그대로 status를 넘겨줌
    return Response.json(data ?? {}, { status: res.status });
}
