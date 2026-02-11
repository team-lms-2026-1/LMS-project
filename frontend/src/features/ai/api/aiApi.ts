import { getJson } from "@/lib/http";
import { AiaskRequest, SuccessResponse } from "./types";

export async function aiAskApi(body: AiaskRequest) {
    return getJson<SuccessResponse>(`/api/student/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store"
    })
}