import { getJson, postJson } from "@/lib/http";
import type { DiagnosisDetailResponse, DiagnosisListResponse, DiagnosisSubmitPayload } from "./types";

export async function fetchDiagnosisList() {
  return getJson<DiagnosisListResponse>("/api/student/competencies/dignosis");
}

export async function fetchDiagnosisDetail(dignosisId: number | string) {
  const encodedId = encodeURIComponent(String(dignosisId));
  return getJson<DiagnosisDetailResponse>(`/api/student/competencies/dignosis/${encodedId}`);
}

export async function submitDiagnosis(dignosisId: number | string, payload: DiagnosisSubmitPayload) {
  const encodedId = encodeURIComponent(String(dignosisId));
  return postJson(`/api/student/competencies/dignosis/${encodedId}/submit`, payload);
}
