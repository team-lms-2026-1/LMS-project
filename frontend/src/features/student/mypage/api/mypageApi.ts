import { getJson } from "@/lib/http";
import { StudentMypageResponse, ApiResponse } from "./types";
import { cookies } from "next/headers";

export class MypageApi {
    static async getStudentMypageServer(
        year?: number,
        term?: string
    ): Promise<StudentMypageResponse | null> {
        const queryParams = new URLSearchParams();
        if (year) queryParams.append("year", year.toString());
        if (term) queryParams.append("term", term);

        const queryString = queryParams.toString();
        // Server-side call needs absolute URL to backend
        const url = `http://localhost:8080/api/v1/student/mypage${queryString ? `?${queryString}` : ""}`;

        const cookieStore = cookies();
        const accessToken = cookieStore.get("access_token")?.value;

        console.log("[MypageApi] Access Token:", accessToken ? "Present" : "Missing");

        const headers: HeadersInit = {};
        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        }

        try {
            console.log("[MypageApi] Fetching URL:", url);
            const response = await getJson<ApiResponse<StudentMypageResponse>>(url, {
                headers,
                cache: "no-store", // Ensure fresh data
            });
            console.log("[MypageApi] Response data:", response.data ? "Success" : "Empty");
            return response.data;
        } catch (e) {
            console.error("[MypageApi] Failed to fetch mypage data:", e);
            return null;
        }
    }
}
