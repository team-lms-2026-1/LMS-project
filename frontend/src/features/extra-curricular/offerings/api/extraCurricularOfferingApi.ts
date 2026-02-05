import { getJson } from "@/lib/http";
import { ExtraCurricularOfferingCreateRequest, ExtraCurricularOfferingDetailResponse, ExtraCurricularOfferingDetailUpdateRequest, ExtraCurricularOfferingListResponsee, SuccessResponse } from "./types";
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

export async function updateCurricularOfferingDetail(
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
