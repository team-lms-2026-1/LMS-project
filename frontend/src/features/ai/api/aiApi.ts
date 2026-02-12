import { getJson } from "@/lib/http";
import { AiaskRequest, AiaskResponse } from "./types";

export async function aiAskApi(body: AiaskRequest) {
    return getJson<AiaskResponse>(`/api/student/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store"
    })
}