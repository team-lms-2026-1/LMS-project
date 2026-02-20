import { getJson } from "@/lib/http";
import type { StudentCompetencyDashboardResponse } from "./types";

export type StudentResultDashboardQuery = {
  studentId: number | string;
  semesterId?: number | string;
};

export async function fetchStudentResultDashboard(query: StudentResultDashboardQuery) {
  const sp = new URLSearchParams();
  if (query.semesterId !== undefined && query.semesterId !== null && String(query.semesterId).trim()) {
    sp.set("semesterId", String(query.semesterId));
  }

  const qs = sp.toString();
  const base = `/api/student/competencies/students/${encodeURIComponent(String(query.studentId))}/dashboard`;
  const url = qs ? `${base}?${qs}` : base;
  return getJson<StudentCompetencyDashboardResponse>(url);
}
