import { NextResponse } from "next/server";

function resolveBaseUrl() {
    return process.env.API_BASE_URL ?? "http://localhost:8080";
}

export async function POST(req: Request) {
    let body: { token: string; newPassword: string };
    try {
        body = (await req.json()) as { token: string; newPassword: string };
    } catch {
        return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
    }

    if (!body?.token || !body?.newPassword) {
        return NextResponse.json({ message: "토큰 또는 새 비밀번호가 누락되었습니다." }, { status: 400 });
    }

    const upstreamUrl = `${resolveBaseUrl().replace(/\/+$/, "")}/api/v1/auth/password-reset/confirm`;

    let upstreamRes: Response;
    try {
        upstreamRes = await fetch(upstreamUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ token: body.token, newPassword: body.newPassword }),
            cache: "no-store",
        });
    } catch (e) {
        const detail = e instanceof Error ? e.message : String(e);
        return NextResponse.json(
            { message: "서버 연결에 실패했습니다.", detail },
            { status: 502 }
        );
    }

    const raw = await upstreamRes.text();
    let msg = "비밀번호 재설정 중 오류가 발생했습니다.";
    try {
        const parsed = JSON.parse(raw);
        msg = parsed?.error?.message ?? parsed?.message ?? msg;
    } catch { }

    if (!upstreamRes.ok) {
        return NextResponse.json({ message: msg }, { status: upstreamRes.status });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}
