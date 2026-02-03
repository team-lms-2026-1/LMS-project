import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const BASE_UPSTREAM_ADMIN = "/api/v1/admin/surveys";

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
    // 통계 API는 Admin만 접근 가능: /api/v1/admin/surveys/{id}/stats
    const upstreamUrl = `${getBaseUrl()}${BASE_UPSTREAM_ADMIN}/${params.id}/stats`;
    return proxy(req, upstreamUrl, "GET", false);
}
