import { proxyToBackend } from "@/lib/bff";

export const runtime = "nodejs";

async function handleRequest(req: Request, { params }: { params: { departmentId: string } }) {
    const { departmentId } = params;
    const method = req.method as "GET" | "PATCH" | "DELETE";
    let body = undefined;

    if (method !== "GET" && method !== "HEAD" && method !== "DELETE") {
        try {
            const bodyText = await req.text();
            if (bodyText) {
                body = JSON.parse(bodyText);
            }
        } catch (e) {
            console.warn("[DepartmentDetailBFF] Failed to parse request body", e);
        }
    }

    return proxyToBackend(req, `/api/v1/admin/depts/${departmentId}`, {
        method,
        body,
    });
}

export async function GET(req: Request, context: any) { return handleRequest(req, context); }
// 학과 수정
export async function PATCH(req: Request, context: any) { return handleRequest(req, context); }
// 학과 삭제 (필요한 경우)
export async function DELETE(req: Request, context: any) { return handleRequest(req, context); }

// 필요 시 POST, PUT 추가
