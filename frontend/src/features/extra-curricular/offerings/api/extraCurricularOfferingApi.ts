import { getJson } from "@/lib/http";
import {
  ExtraSessionUpdateRequest,
  ExtraSessionDetailResponse,
  ExtraSessionListResponse,
  ExtraCurricularOfferingCompetencyMappingBulkUpdateRequest,
  ExtraCurricularOfferingCompetencyResponse,
  ExtraCurricularOfferingCreateRequest,
  ExtraCurricularOfferingDetailResponse,
  ExtraCurricularOfferingDetailUpdateRequest,
  ExtraCurricularOfferingListResponsee,
  ExtraCurricularOfferingStatusUpdateRequest,
  ExtraCurricularSessionCreateRequest,
  ExtraSessionVideoPresignRequest,
  ExtraSessionVideoPresignResponse,
  SuccessResponse,
  ExtraSessionStatusChangeRequest,
  ExtraOfferingApplicantListResponse,
  ExtraCurricularGradeListResponse,
  ExtraGradeDetailHeaderResponse,
  ExtraCompletionListResponse,
} from "./types";
import { ExtraCurricularOfferingUserListResponse } from "@/features/student/extra-curricular/offerings/api/types";

export type ExtraCurricularOfferingListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
  semesterId?: number;
};

export async function fetchExtraCurricularOfferingList(query: ExtraCurricularOfferingListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);
  if (query.semesterId != null) {
    sp.set("semesterId", String(query.semesterId));
  }

  const qs = sp.toString();
  const url = qs ? `/api/admin/extra-curricular/offerings?${qs}` : `/api/admin/extra-curricular/offerings`;

  return getJson<ExtraCurricularOfferingListResponsee>(url);
}

export async function createExtraCurricularOffering(body: ExtraCurricularOfferingCreateRequest) {
    return getJson<SuccessResponse>(`/api/admin/extra-curricular/offerings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store"
    })
}

export async function fetchExtraCurricularDetail(id: number) {
  const url = `/api/admin/extra-curricular/offerings/${id}/basic`
  return getJson<ExtraCurricularOfferingDetailResponse>( url, {
      cache: "no-store"
  });
}

export async function updateExtraCurricularOfferingDetail(
  id: number,
  body: ExtraCurricularOfferingDetailUpdateRequest
) {
  return getJson<SuccessResponse>(`/api/admin/extra-curricular/offerings/${id}/basic`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  })
}

// status
export async function updateExtraCurricularOfferingStatus(
  id: number,
  body: ExtraCurricularOfferingStatusUpdateRequest
) {
  return getJson<SuccessResponse>(`/api/admin/extra-curricular/offerings/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  })
}


// competency
export async function fetchExtraCurricularOfferingCompetency(id: number) {
  const url = `/api/admin/extra-curricular/offerings/${id}/competency`
  return getJson<ExtraCurricularOfferingCompetencyResponse>( url, {
      cache: "no-store"
  });
}

export async function updateExtraCurricularOfferingCompetency(
  id: number,
  body: ExtraCurricularOfferingCompetencyMappingBulkUpdateRequest
) {
  console.log("updateExtraCurricularOfferingStatus body =", body);
  console.log("stringified =", JSON.stringify(body));
  return getJson<SuccessResponse>(`/api/admin/extra-curricular/offerings/${id}/competency`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  })
}

// presign
export async function presignExtraSessionVideoUpload(
  extraOfferingId: number,
  body: ExtraSessionVideoPresignRequest
) {
  return getJson<ExtraSessionVideoPresignResponse>(
    `/api/admin/extra-curricular/offerings/${extraOfferingId}/sessions/presign`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );
}

// session list

export type ExtraSessionListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
};

export async function fetchExtraSessionList(id: number, query: ExtraSessionListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);

  const qs = sp.toString();
  const url = qs ? `/api/admin/extra-curricular/offerings/${id}/sessions?${qs}` : `/api/admin/extra-curricular/offerings/${id}/sessions`;

  return getJson<ExtraSessionListResponse>(url);
}

// applicant list
export type ExtraOfferingApplicantListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
};

export async function fetchExtraOfferingApplicantList(
  offeringId: number,
  query: ExtraOfferingApplicantListQuery
) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);

  const qs = sp.toString();
  const url = qs
    ? `/api/admin/extra-curricular/offerings/${offeringId}/applications?${qs}`
    : `/api/admin/extra-curricular/offerings/${offeringId}/applications`;

  return getJson<ExtraOfferingApplicantListResponse>(url);
}

// grade (admin)
export type ExtraGradeListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
  deptId?: number;
};

export async function fetchExtraCurricularGradeList(query: ExtraGradeListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);
  if (query.deptId != null) {
    sp.set("deptId", String(query.deptId));
  }

  const qs = sp.toString();
  const url = qs
    ? `/api/admin/extra-curricular/grade-reports?${qs}`
    : `/api/admin/extra-curricular/grade-reports`;

  return getJson<ExtraCurricularGradeListResponse>(url);
}

export async function fetchExtraCurricularGradeDetailHeader(studentAccountId: number) {
  const url = `/api/admin/extra-curricular/grade-reports/${studentAccountId}`;
  return getJson<ExtraGradeDetailHeaderResponse>(url, { cache: "no-store" });
}

export type ExtraGradeDetailListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
  semesterId?: number;
};

export async function fetchExtraCurricularGradeDetailList(
  query: ExtraGradeDetailListQuery,
  studentAccountId: number
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
    ? `/api/admin/extra-curricular/grade-reports/${studentAccountId}/list?${qs}`
    : `/api/admin/extra-curricular/grade-reports/${studentAccountId}/list`;

  return getJson<ExtraCompletionListResponse>(url);
}

// session create
export async function createExtraCurricularSession(
  extraOfferingId: number,
  body: ExtraCurricularSessionCreateRequest
) {
  return getJson<SuccessResponse>(
    `/api/admin/extra-curricular/offerings/${extraOfferingId}/sessions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );
}

// session detail
export async function fetchExtraSessionDetail(offeringId: number, sessionId: number) {

  const url = `/api/admin/extra-curricular/offerings/${offeringId}/sessions/${sessionId}`;

  return getJson<ExtraSessionDetailResponse>(url)
}

// 세션 수정(PATCH)
export async function updateExtraSession(
  offeringId: number,
  sessionId: number,
  body: ExtraSessionUpdateRequest
) {
  return getJson<SuccessResponse>(
    `/api/admin/extra-curricular/offerings/${offeringId}/sessions/${sessionId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );
}

// 세션 상태변경
export async function changeExtraSessionStatus(
  offeringId: number,
  sessionId: number,
  body: ExtraSessionStatusChangeRequest
) {
  return getJson<SuccessResponse>(
    `/api/admin/extra-curricular/offerings/${offeringId}/sessions/${sessionId}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );
}
