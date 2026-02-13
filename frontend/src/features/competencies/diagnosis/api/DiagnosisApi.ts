import { deleteJson, getJson, patchJson, postJson } from "@/lib/http";
import type {
  DiagnosisCreatePayload,
  DiagnosisDetailResponse,
  DiagnosisListResponse,
  DiagnosisDistributionResponse,
  DiagnosisParticipantsResponse,
  DiagnosisUpsertPayload,
} from "./types";

export type DiagnosisListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
};

export async function fetchDiagnosisList(query: DiagnosisListQuery) {
  const sp = new URLSearchParams();
  if (typeof query.page === "number") sp.set("page", String(query.page));
  if (typeof query.size === "number") sp.set("size", String(query.size));
  if (query.keyword?.trim()) sp.set("keyword", query.keyword.trim());

  const qs = sp.toString();
  const url = qs ? `/api/admin/competencies/dignosis?${qs}` : `/api/admin/competencies/dignosis`;
  return getJson<DiagnosisListResponse>(url);
}

export async function createDiagnosis(payload: DiagnosisCreatePayload) {
  return postJson(`/api/admin/competencies/dignosis`, payload);
}

export async function fetchDiagnosisDetail(id: string | number) {
  const encodedId = encodeURIComponent(String(id));
  return getJson<DiagnosisDetailResponse>(`/api/admin/competencies/dignosis/${encodedId}`);
}

export async function fetchDiagnosisDistribution(id: string | number) {
  const encodedId = encodeURIComponent(String(id));
  return getJson<DiagnosisDistributionResponse>(
    `/api/admin/competencies/dignosis/${encodedId}/responses/distribution`
  );
}

export async function updateDiagnosis(id: string | number, payload: DiagnosisUpsertPayload) {
  const encodedId = encodeURIComponent(String(id));
  return patchJson(`/api/admin/competencies/dignosis/${encodedId}`, payload);
}

export async function deleteDiagnosis(id: string | number) {
  const encodedId = encodeURIComponent(String(id));
  return deleteJson(`/api/admin/competencies/dignosis/${encodedId}`);
}

export type DiagnosisParticipantsQuery = {
  page?: number;
  size?: number;
};

export async function fetchDiagnosisParticipants(
  id: string | number,
  query: DiagnosisParticipantsQuery = {}
) {
  const encodedId = encodeURIComponent(String(id));
  const sp = new URLSearchParams();
  if (typeof query.page === "number") sp.set("page", String(query.page));
  if (typeof query.size === "number") sp.set("size", String(query.size));
  const qs = sp.toString();
  const url = qs
    ? `/api/admin/competencies/dignosis/${encodedId}/participants?${qs}`
    : `/api/admin/competencies/dignosis/${encodedId}/participants`;
  return getJson<DiagnosisParticipantsResponse>(url);
}
