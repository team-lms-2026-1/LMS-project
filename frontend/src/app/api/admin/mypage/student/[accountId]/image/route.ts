import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

function getBaseUrl() {
    return process.env.ADMIN_API_BASE_URL ?? process.env.API_BASE_URL;
}

function getToken() {
    let token = cookies().get("access_token")?.value;
    if (token) {
        token = decodeURIComponent(token)
            .replace(/^"|"$/g, "")
            .replace(/^Bearer\s+/i, "")
            .trim();
    }
    return token;
}

function buildHeaders(isMultipart = false) {
    const token = getToken();
    const headers = new Headers();
    if (!isMultipart) {
        headers.set("Content-Type", "application/json");
    }
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
}

export async function POST(req: Request, { params }: { params: { accountId: string } }) {
    const base = getBaseUrl();
    const accountId = params.accountId;
    const upstreamUrl = `${base}/api/v1/admin/mypage/student/${accountId}/image`;

    // Multipart/form-data 그대로 중계
    const formData = await req.formData();

    try {
        const upstreamRes = await fetch(upstreamUrl, {
            method: "POST",
            headers: buildHeaders(true),
            body: formData,
            cache: "no-store",
        });

        return new Response(upstreamRes.body, {
            status: upstreamRes.status,
            headers: upstreamRes.headers,
        });
    } catch (e: any) {
        return NextResponse.json({ message: "상위 서버 연결 실패", error: e.message }, { status: 502 });
    }
}

export async function PATCH(req: Request, { params }: { params: { accountId: string } }) {
    const base = getBaseUrl();
    const accountId = params.accountId;
    const upstreamUrl = `${base}/api/v1/admin/mypage/student/${accountId}/image`;

    const formData = await req.formData();

    try {
        const upstreamRes = await fetch(upstreamUrl, {
            method: "PATCH",
            headers: buildHeaders(true),
            body: formData,
            cache: "no-store",
        });

        return new Response(upstreamRes.body, {
            status: upstreamRes.status,
            headers: upstreamRes.headers,
        });
    } catch (e: any) {
        return NextResponse.json({ message: "상위 서버 연결 실패", error: e.message }, { status: 502 });
    }
}

export async function GET(req: Request, { params }: { params: { accountId: string } }) {
    const base = getBaseUrl();
    const accountId = params.accountId;
    const upstreamUrl = `${base}/api/v1/admin/mypage/student/${accountId}/image`;

    try {
        const upstreamRes = await fetch(upstreamUrl, {
            method: "GET",
            headers: buildHeaders(),
            cache: "no-store",
        });

        return new Response(upstreamRes.body, {
            status: upstreamRes.status,
            headers: upstreamRes.headers,
        });
    } catch (e: any) {
        return NextResponse.json({ message: "상위 서버 연결 실패", error: e.message }, { status: 502 });
    }
}

export async function DELETE(req: Request, { params }: { params: { accountId: string } }) {
    const base = getBaseUrl();
    const accountId = params.accountId;
    const upstreamUrl = `${base}/api/v1/admin/mypage/student/${accountId}/image`;

    try {
        const upstreamRes = await fetch(upstreamUrl, {
            method: "DELETE",
            headers: buildHeaders(),
            cache: "no-store",
        });

        return new Response(upstreamRes.body, {
            status: upstreamRes.status,
            headers: upstreamRes.headers,
        });
    } catch (e: any) {
        return NextResponse.json({ message: "상위 서버 연결 실패", error: e.message }, { status: 502 });
    }
}
