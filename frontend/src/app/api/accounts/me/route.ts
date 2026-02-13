import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { resolveBaseUrl } from "@/lib/bff";

// Removed hardcoded BACKEND_URL

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get("access_token")?.value;
        const backendUrl = resolveBaseUrl();

        const res = await fetch(`${backendUrl}/api/v1/accounts/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!res.ok) {
            return NextResponse.json({ message: "Failed to fetch profile" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("[BFF] /accounts/me error:", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}
