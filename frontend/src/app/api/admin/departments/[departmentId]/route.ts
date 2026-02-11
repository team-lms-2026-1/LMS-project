import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const BACKEND_URL = "http://localhost:8080";

function getAccessToken() {
    const cookieStore = cookies();
    return cookieStore.get("access_token")?.value;
}

// 상세/수정/삭제 (e.g. /departments/123)
async function handleRequest(req: Request, { params }: { params: { departmentId: string } }) {
    try {
        const { departmentId } = params;
        const { searchParams } = new URL(req.url);
        const queryString = searchParams.toString();

        // URL 구성: .../admin/depts/{id}
        const upstreamUrl = `${BACKEND_URL}/api/v1/admin/depts/${departmentId}${queryString ? `?${queryString}` : ""}`;

        const headers = new Headers();
        headers.set("Content-Type", "application/json");

        const token = getAccessToken();
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        const fetchOptions: RequestInit = {
            method: req.method,
            headers,
            cache: "no-store",
        };

        if (req.method !== "GET" && req.method !== "HEAD") {
            try {
                const bodyText = await req.text();
                if (bodyText) {
                    fetchOptions.body = bodyText;
                }
            } catch (e) {
                console.warn("Failed to read request body", e);
            }
        }

        const res = await fetch(upstreamUrl, fetchOptions);

        let data;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await res.json();
        } else {
            const text = await res.text();
            try {
                data = text ? JSON.parse(text) : null;
            } catch {
                data = null;
            }
        }

        if (data === undefined || data === null) {
            return new NextResponse(null, { status: res.status });
        }

        return NextResponse.json(data, {
            status: res.status,
        });
    } catch (error) {
        console.error(`[BFF] /admin/departments/[id] ${req.method} error:`, error);
        return NextResponse.json(
            { message: "BFF admin/departments/[id] error" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request, context: any) { return handleRequest(req, context); }
export async function PATCH(req: Request, context: any) { return handleRequest(req, context); }
export async function DELETE(req: Request, context: any) { return handleRequest(req, context); }
// 필요하다면 POST, PUT 추가 (보통 상세 경로엔 잘 안씀)
