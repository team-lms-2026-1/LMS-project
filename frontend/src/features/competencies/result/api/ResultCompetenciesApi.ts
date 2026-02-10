import { getJson } from "@/lib/http";
import type { ResultCompetencyDashboardResponse } from "./types";

export type ResultCompetencyQuery = {
  dignosisId: string;
  deptId?: string;
  deptName?: string;
};

export async function fetchResultCompetencyDashboard(query: ResultCompetencyQuery) {
  const sp = new URLSearchParams();
  if (query?.deptId) sp.set("deptId", query.deptId);
  if (query?.deptName) sp.set("deptName", query.deptName);

  const qs = sp.toString();
  const base = `/api/admin/competencies/dignosis/${encodeURIComponent(query.dignosisId)}/report`;
  const url = qs ? `${base}?${qs}` : base;
  return getJson<ResultCompetencyDashboardResponse>(url);
}
