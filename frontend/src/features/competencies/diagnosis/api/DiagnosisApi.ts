import { getJson } from "@/lib/http";
import type { DiagnosisListResponse } from "./types";

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
