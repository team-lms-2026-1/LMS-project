import { getJson } from "@/lib/http";
import { SuccessResponse } from "@/features/curricular/api/types";
import {
  ExtraCurricularOfferingCompetencyResponse,
  ExtraCurricularOfferingDetailResponse,
  ExtraCurricularEnrollmentListResponse,
  ExtraCurricularOfferingUserListResponse,
  ExtraSessionDetailResponse,
  ExtraSessionListResponse,
  StudentExtraCompletionListResponse,
  StudentExtraGradeDetailHeaderResponse,
} from "./types";

export type ExtraCurricularOfferingUserListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
};

// list
export async function fetchCurricularOfferingsList(query: ExtraCurricularOfferingUserListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);

  const qs = sp.toString();
  const url = qs ? `/api/student/extra-curricular/offerings?${qs}` : `/api/student/extra-curricular/offerings`;

  return getJson<ExtraCurricularOfferingUserListResponse>(url);
}

export async function fetchStudentExtraCurricularDetail(id: number) {
  const url = `/api/student/extra-curricular/offerings/${id}/basic`
  return getJson<ExtraCurricularOfferingDetailResponse>( url, {
      cache: "no-store"
  });
}

// enroll
export async function enrollExtraCurricularOffering(id: number) {
  const url = `/api/student/extra-curricular/offerings/${id}/enroll`;
  return getJson<SuccessResponse>(url, {
    method: "POST",
    cache: "no-store",
  });
}

// cancel
export async function cancelExtraCurricularOffering(id: number) {
  const url = `/api/student/extra-curricular/offerings/${id}/cancel`;
  return getJson<SuccessResponse>(url, {
    method: "POST",
    cache: "no-store",
  });
}

export async function fetchStudentExtraCurricularCompetency(offeringId: number) {
  const url = `/api/student/extra-curricular/offerings/${offeringId}/competency`;
  return getJson<ExtraCurricularOfferingCompetencyResponse>(url, {
    cache: "no-store",
  });
}

export type ExtraCurricularEnrollmentsListQuery = {
  page?: number;
  size?: number;
};

export async function fetchStudentExtraCurricularEnrollmentsList(
  query: ExtraCurricularEnrollmentsListQuery
) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));

  const qs = sp.toString();
  const url = qs ? `/api/student/extra-curricular/enrollments?${qs}` : `/api/student/extra-curricular/enrollments`;

  return getJson<ExtraCurricularEnrollmentListResponse>(url);
}

export async function fetchStudentExtraGradeMeHeader() {
  const url = `/api/student/extra-curricular/grade-reports/me`;
  return getJson<StudentExtraGradeDetailHeaderResponse>(url, {
    cache: "no-store",
  });
}

export type ExtraCurricularGradeListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
  semesterId?: number;
};

export async function fetchStudentExtraGradeMeList(
  query: ExtraCurricularGradeListQuery
) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);
  if (query.semesterId != null) {
    sp.set("semesterId", String(query.semesterId));
  }

  const qs = sp.toString();
  const url = qs
    ? `/api/student/extra-curricular/grade-reports/me/list?${qs}`
    : `/api/student/extra-curricular/grade-reports/me/list`;

  return getJson<StudentExtraCompletionListResponse>(url);
}

export async function fetchStudentExtraCurricularCurrentEnrollmentsList(
  query: ExtraCurricularEnrollmentsListQuery
) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));

  const qs = sp.toString();
  const url = qs
    ? `/api/student/extra-curricular/current-enrollments?${qs}`
    : `/api/student/extra-curricular/current-enrollments`;

  return getJson<ExtraCurricularEnrollmentListResponse>(url);
}

export type ExtraSessionListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
};

export async function fetchStudentExtraSessionList(
  offeringId: number,
  query: ExtraSessionListQuery
) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);

  const qs = sp.toString();
  const url = qs
    ? `/api/student/extra-curricular/offerings/${offeringId}/sessions?${qs}`
    : `/api/student/extra-curricular/offerings/${offeringId}/sessions`;

  return getJson<ExtraSessionListResponse>(url);
}

export async function fetchStudentExtraSessionDetail(
  offeringId: number,
  sessionId: number
) {
  const url = `/api/student/extra-curricular/offerings/${offeringId}/sessions/${sessionId}`;
  return getJson<ExtraSessionDetailResponse>(url, { cache: "no-store" });
}

export async function markStudentExtraSessionAttendance(
  offeringId: number,
  sessionId: number,
  watchedSeconds: number
) {
  const url = `/api/student/extra-curricular/offerings/${offeringId}/sessions/${sessionId}/attendance`;
  return getJson<SuccessResponse>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ watchedSeconds }),
    cache: "no-store",
  });
}
