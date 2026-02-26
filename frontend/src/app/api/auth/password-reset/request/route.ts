import { NextResponse } from "next/server";

function resolveBaseUrl() {
    return process.env.API_BASE_URL ?? "http://localhost:8080";
}

export async function POST(req: Request) {
    let body: { email: string };
    try {
        body = (await req.json()) as { email: string };
    } catch {
        return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
    }

    if (!body?.email) {
        return NextResponse.json({ message: "이메일을 입력하세요." }, { status: 400 });
    }

    const upstreamUrl = `${resolveBaseUrl().replace(/\/+$/, "")}/api/v1/auth/password-reset/request`;

    // 클라이언트 IP 전달 (백엔드에서 createdIp 기록용)
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    let upstreamRes: Response;
    try {
        upstreamRes = await fetch(upstreamUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-Forwarded-For": clientIp,
            },
            body: JSON.stringify({ email: body.email }),
            cache: "no-store",
        });
    } catch (e) {
        const detail = e instanceof Error ? e.message : String(e);
        return NextResponse.json(
            { message: "서버 연결에 실패했습니다.", detail },
            { status: 502 }
        );
    }

    if (!upstreamRes.ok) {
        const raw = await upstreamRes.text();
        let msg = "요청 처리 중 오류가 발생했습니다.";
        try {
            const parsed = JSON.parse(raw);
            msg = parsed?.error?.message ?? parsed?.message ?? msg;
        } catch { }
        return NextResponse.json({ message: msg }, { status: upstreamRes.status });
    }

    // 보안상 이메일 존재 여부와 무관하게 성공 응답 (항상 동일 응답)
    return NextResponse.json({ success: true }, { status: 200 });
}
