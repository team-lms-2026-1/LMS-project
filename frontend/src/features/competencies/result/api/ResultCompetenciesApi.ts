import { getJson } from "@/lib/http";
import type { ApiResponse } from "./types";
import type { ResultCompetencyDashboardResponse } from "./types";

export type ResultCompetencyQuery = {
  dignosisId: string;
  deptId?: string;
  deptName?: string;
  semesterId?: string;
  semesterName?: string;
};

export async function fetchResultCompetencyDashboard(query: ResultCompetencyQuery) {
  const sp = new URLSearchParams();
  if (query?.deptId) sp.set("deptId", query.deptId);
  if (query?.deptName) sp.set("deptName", query.deptName);
  if (query?.semesterId) sp.set("semesterId", query.semesterId);
  if (query?.semesterName) sp.set("semesterName", query.semesterName);

  const qs = sp.toString();
  const base = `/api/admin/competencies/dignosis/${encodeURIComponent(query.dignosisId)}/report`;
  const url = qs ? `${base}?${qs}` : base;
  return getJson<ResultCompetencyDashboardResponse>(url);
}

export async function recalculateCompetencySummary(semesterId: string) {
  const qs = new URLSearchParams({ semesterId }).toString();
  return getJson<ApiResponse<null>>(`/api/admin/competencies/recalculate?${qs}`, {
    method: "POST",
  });
}
