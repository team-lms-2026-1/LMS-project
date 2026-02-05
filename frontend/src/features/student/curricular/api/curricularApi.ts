import { getJson } from "@/lib/http";
import { SuccessResponse } from "@/features/curricular/api/types";
import { CurricularEnrollmentListResponse, CurricularOfferingListResponse } from "./types";
import { CurricularDetailFormResponse, CurricularOfferingCompetencyResponse, StudentGradeDetailHeaderResponse, StudentGradeDetailListResponse } from "@/features/curricular-offering/api/types";

export type CurricularOfferingsListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
  semesterId?: number;
};

// list
export async function fetchCurricularOfferingsList(query: CurricularOfferingsListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);
  if (query.semesterId != null) {
    sp.set("semesterId", String(query.semesterId));
  }

  const qs = sp.toString();
  const url = qs ? `/api/student/curricular/offerings?${qs}` : `/api/student/curricular/offerings`;

  return getJson<CurricularOfferingListResponse>(url);
}

export async function fetchCurricularEnrollmentsList(query: CurricularOfferingsListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));

  const qs = sp.toString();
  const url = qs ? `/api/student/curricular/enrollments?${qs}` : `/api/student/curricular/enrollments`;

  return getJson<CurricularEnrollmentListResponse>(url);
}

export async function fetchCurricularCurrentEnrollmentsList(query: CurricularOfferingsListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));

  const qs = sp.toString();
  const url = qs ? `/api/student/curricular/current-enrollments?${qs}` : `/api/student/curricular/current-enrollments`;

  return getJson<CurricularEnrollmentListResponse>(url);
}


// detail
export async function fetchCurricularDetailForm(id: number) {
  const url = `/api/student/curricular/offerings/${id}/basic`
  return getJson<CurricularDetailFormResponse>( url, {
      cache: "no-store"
  });
}

// enroll
export async function enrollCurricularOffering(id: number) {
  const url = `/api/student/curricular/offerings/${id}/enroll`;
  return getJson<SuccessResponse>(url, {
    method: "POST",
    cache: "no-store",
  });
}

// cancel
export async function cancelCurricularOffering(id: number) {
  const url = `/api/student/curricular/offerings/${id}/cancel`;
  return getJson<SuccessResponse>(url, {
    method: "POST",
    cache: "no-store",
  });
}

// compentecy
export async function fetchCurricularOfferingCompetency(id: number) {
  const url = `/api/student/curricular/offerings/${id}/competency`
  return getJson<CurricularOfferingCompetencyResponse>( url, {
      cache: "no-store"
  });
}

// grade detail-header
export async function fetchCurricularGradeMeHeader() {
  const url = `/api/student/curricular/grade-reports/me`
  return getJson<StudentGradeDetailHeaderResponse>( url, {
      cache: "no-store"
  });
}

// grade detail-list
export type CurricularGradeDetailListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
  semesterId?: number;
};

export async function fetchCurricularGradeMeList(query: CurricularGradeDetailListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);
  if (query.semesterId != null) {
    sp.set("semesterId", String(query.semesterId));
  }

  const qs = sp.toString();
  const url = qs ? `/api/student/curricular/grade-reports/me/list?${qs}` : `/api/student/curricular/grade-reports/me/list`;

  return getJson<StudentGradeDetailListResponse>(url);
}