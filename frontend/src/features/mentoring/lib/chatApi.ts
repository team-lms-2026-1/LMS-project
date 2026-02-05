import { getJson, postJson } from "@/lib/http";
import { MentoringMatchingResponse, ChatMessageResponse } from "../types";

export type MentoringMatching = MentoringMatchingResponse;
export type ChatMessage = ChatMessageResponse;

export async function fetchMyMatchings(): Promise<MentoringMatching[]> {
    return getJson("/api/mentoring/matchings");
}

export async function fetchChatHistory(matchingId: number): Promise<ChatMessage[]> {
    return getJson(`/api/mentoring/matchings/${matchingId}/chat`);
}

export async function sendQuestion(data: { matchingId: number; content: string }) {
    return postJson("/api/mentoring/questions", data);
}

export async function sendAnswer(data: { questionId: number; content: string }) {
    return postJson("/api/mentoring/answers", data);
}
