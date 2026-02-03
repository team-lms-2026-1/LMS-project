import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const BASE_UPSTREAM_ADMIN = "/api/v1/admin/surveys";
const BASE_UPSTREAM_PUBLIC = "/api/v1/surveys";

function getBaseUrl() {
    return process.env.ADMIN_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://localhost:8080";
}

function getAccessToken() {
    const cookieStore = cookies();
    return cookieStore.get("access_token")?.value;
}

function buildUpstreamHeaders(req: Request) {
    const headers = new Headers(req.headers);
    headers.delete("host");
    headers.delete("connection");
    headers.delete("content-length");
    headers.delete("cookie");
    headers.delete("accept-encoding");

    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    return headers;
}

async function proxy(req: Request, upstreamUrl: string, method: string, withBody: boolean) {
    const headers = buildUpstreamHeaders(req);
    const init: RequestInit = {
        method,
        headers,
        cache: "no-store",
    };

    try {
        if (withBody) {
            const bodyText = await req.text();
            if (bodyText) {
                init.body = bodyText;
                headers.set("Content-Type", "application/json");
            }
        }

        const res = await fetch(upstreamUrl, init);
        const outHeaders = new Headers(res.headers);
        outHeaders.delete("transfer-encoding");

        return new NextResponse(res.body, {
            status: res.status,
            headers: outHeaders,
        });
    } catch (e) {
        console.error(`Proxy Error [${method} ${upstreamUrl}]`, e);
        return NextResponse.json({ message: "Proxy Error" }, { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
    // 백엔드에는 /api/v1/admin/surveys/{id} (GET)이 없고
    // /api/v1/surveys/{id} (GET)만 존재함 (여기서 관리자 권한도 체크함)
    const upstreamUrl = `${getBaseUrl()}${BASE_UPSTREAM_PUBLIC}/${params.id}`;
    return proxy(req, upstreamUrl, "GET", false);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    // 수정은 Admin API
    const upstreamUrl = `${getBaseUrl()}${BASE_UPSTREAM_ADMIN}/${params.id}`;
    return proxy(req, upstreamUrl, "PUT", true);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    // 삭제는 Admin API
    const upstreamUrl = `${getBaseUrl()}${BASE_UPSTREAM_ADMIN}/${params.id}`;
    return proxy(req, upstreamUrl, "DELETE", false);
}
