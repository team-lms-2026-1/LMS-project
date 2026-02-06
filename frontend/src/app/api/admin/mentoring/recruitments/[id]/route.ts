import { proxyToBackend } from "@/lib/bff";
import { NextRequest } from "next/server";

interface RouteParams {
    params: {
        id: string;
    };
}

// 상세 조회
export async function GET(req: NextRequest, { params }: RouteParams) {
    const { id } = params;
    return proxyToBackend(req, `/api/v1/mentoring/recruitments/${id}`);
}

// 수정
export async function PUT(req: NextRequest, { params }: RouteParams) {
    const { id } = params;
    const body = await req.json();
    return proxyToBackend(req, `/api/v1/admin/mentoring/recruitments/${id}`, {
        method: "PUT",
        body,
    });
}

// 삭제
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    const { id } = params;
    return proxyToBackend(req, `/api/v1/admin/mentoring/recruitments/${id}`, {
        method: "DELETE",
    });
}
