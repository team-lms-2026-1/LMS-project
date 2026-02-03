
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

function getBaseUrl() {
    return process.env.API_BASE_URL ?? "http://localhost:8080";
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

async function proxy(req: Request, upstreamUrl: string, method: string) {
    const headers = buildUpstreamHeaders(req);
    const init: RequestInit = {
        method,
        headers,
        cache: "no-store",
    };

    try {
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
    const upstreamUrl = `${getBaseUrl()}/api/v1/surveys/${params.id}`;
    return proxy(req, upstreamUrl, "GET");
}
