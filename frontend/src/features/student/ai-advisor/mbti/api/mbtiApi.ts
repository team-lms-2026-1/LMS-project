import { getJson } from "@/lib/http";
import {
  MbtiInterestKeywordResponse,
  MbtiLatestRecommendationResponse,
  MbtiQuestionResponse,
  MbtiRecommendationRequest,
  MbtiRecommendationResponse,
  MbtiResultResponse,
  MbtiSubmitRequest,
} from "./types";

export async function fetchMbtiQuestions() {
  return getJson<MbtiQuestionResponse>("/api/student/mbti/questions", {
    cache: "no-store",
  });
}

export async function submitMbtiAnswers(body: MbtiSubmitRequest) {
  return getJson<MbtiResultResponse>("/api/student/mbti/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

export async function fetchMbtiResult() {
  return getJson<MbtiResultResponse>("/api/student/mbti/result", {
    cache: "no-store",
  });
}

export async function fetchInterestKeywords() {
  return getJson<MbtiInterestKeywordResponse>("/api/student/mbti/interest-keywords", {
    cache: "no-store",
  });
}

export async function createMbtiRecommendation(body: MbtiRecommendationRequest) {
  return getJson<MbtiRecommendationResponse>("/api/student/mbti/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

export async function fetchLatestRecommendation() {
  return getJson<MbtiLatestRecommendationResponse>("/api/student/mbti/recommendations/latest", {
    cache: "no-store",
  });
}

