import { getJson } from "@/lib/http";
import { ExtraCurricularCreateRequest, ExtraCurricularEditFormDto, ExtraCurricularEditFormResponse, ExtraCurricularListResponse, ExtraCurricularPatchRequest, SuccessResponse } from "./types";

export type CurricularsListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
  deptId?: number;
};

export async function fetchExtraCurricularMasterList(query: CurricularsListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);

  const qs = sp.toString();
  const url = qs ? `/api/admin/extra-curricular/extra-curriculars?${qs}` : `/api/admin/extra-curricular/extra-curriculars`;

  return getJson<ExtraCurricularListResponse>(url);
}

export async function createExtraCurricular(body: ExtraCurricularCreateRequest) {
    return getJson<SuccessResponse>(`/api/admin/extra-curricular/extra-curriculars`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store"
    })
}

export async function fetchCurricularExtraEditForm(id: number) {
  const url = `/api/admin/extra-curricular/extra-curriculars/${id}`
  return getJson<ExtraCurricularEditFormResponse>( url, {
      cache: "no-store"
  });
}

export async function patchExtraCurricular(
  id: number,
  body: ExtraCurricularPatchRequest
) {
  return getJson<SuccessResponse>(`/api/admin/extra-curricular/extra-curriculars/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  })
}