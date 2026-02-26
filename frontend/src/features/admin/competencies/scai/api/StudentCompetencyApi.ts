import { getJson } from "@/lib/http";
import type { StudentCompetencyDashboardResponse, StudentCompetencyListResponse } from "./types";

export type StudentCompetencyListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
  deptName?: string;
};

export async function fetchStudentCompetencyList(query: StudentCompetencyListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);
  if (query.deptName) sp.set("deptName", query.deptName);

  const qs = sp.toString();
  const url = qs ? `/api/admin/competencies/students?${qs}` : `/api/admin/competencies/students`;
  return getJson<StudentCompetencyListResponse>(url);
}

export async function fetchStudentCompetencyDashboard(studentId: number | string) {
  return getJson<StudentCompetencyDashboardResponse>(
    `/api/admin/competencies/students/${encodeURIComponent(String(studentId))}/dashboard`
  );
}
