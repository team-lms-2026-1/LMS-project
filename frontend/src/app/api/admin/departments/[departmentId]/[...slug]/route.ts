import { proxyToBackend } from "@/lib/bff";

export const runtime = "nodejs";

async function handleRequest(req: Request, { params }: { params: { departmentId: string, slug: string[] } }) {
    const { departmentId, slug } = params;
    const subPath = slug.join("/");
    const method = req.method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

    let body = undefined;

    // GET/HEAD 요청이 아닐 경우 body 파싱 시도
    if (method !== "GET" && method !== "HEAD") {
        try {
            const bodyText = await req.text();
            if (bodyText) {
                body = JSON.parse(bodyText);
            }
        } catch (e) {
            console.warn("[DepartmentBFF] Failed to parse request body", e);
            // body가 유효하지 않은 JSON이거나 비어있을 수 있음 -> 없는 취급
        }
    }

    return proxyToBackend(req, `/api/v1/admin/depts/${departmentId}/${subPath}`, {
        method,
        body,
        // forwardQuery: true (default)
    });
}

export async function GET(req: Request, context: any) { return handleRequest(req, context); }
export async function POST(req: Request, context: any) { return handleRequest(req, context); }
export async function PATCH(req: Request, context: any) { return handleRequest(req, context); }
export async function DELETE(req: Request, context: any) { return handleRequest(req, context); }
export async function PUT(req: Request, context: any) { return handleRequest(req, context); }
