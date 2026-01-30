import { getJson } from "@/lib/http";
import { CurricularDetailFormResponse, CurricularOfferingCompetencyMappingBulkUpdateRequest, CurricularOfferingCompetencyResponse, CurricularOfferingCreateRequest, CurricularOfferingDetailUpdateRequest, CurricularOfferingListResponse, CurricularOfferingStatusUpdateRequest } from "./types";
import { SuccessResponse } from "@/features/curricular/api/types";


export type CurricularOfferingsListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
  semesterId?: number;
};


export async function fetchCurricularOfferingsList(query: CurricularOfferingsListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);
  if (query.semesterId != null) {
    sp.set("semesterId", String(query.semesterId));
  }

  const qs = sp.toString();
  const url = qs ? `/api/admin/curricular/offerings?${qs}` : `/api/admin/curricular/offerings`;

  return getJson<CurricularOfferingListResponse>(url);
}

export async function createCurricularOffering(body: CurricularOfferingCreateRequest) {
    return getJson<SuccessResponse>(`/api/admin/curricular/offerings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store"
    })
}

export async function fetchCurricularDetailForm(id: number) {
  const url = `/api/admin/curricular/offerings/${id}/basic`
  return getJson<CurricularDetailFormResponse>( url, {
      cache: "no-store"
  });
}

export async function updateCurricularOfferingDetail(
  id: number,
  body: CurricularOfferingDetailUpdateRequest
) {
  return getJson<SuccessResponse>(`/api/admin/curricular/offerings/${id}/basic`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  })
}

// status
export async function updateCurricularOfferingStatus(
  id: number,
  body: CurricularOfferingStatusUpdateRequest
) {
  return getJson<SuccessResponse>(`/api/admin/curricular/offerings/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  })
}

// compentecy
export async function fetchCurricularOfferingCompetency(id: number) {
  const url = `/api/admin/curricular/offerings/${id}/competency`
  return getJson<CurricularOfferingCompetencyResponse>( url, {
      cache: "no-store"
  });
}

export async function updateCurricularOfferingCompetency(
  id: number,
  body: CurricularOfferingCompetencyMappingBulkUpdateRequest
) {
  return getJson<SuccessResponse>(`/api/admin/curricular/offerings/${id}/competency`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  })
}