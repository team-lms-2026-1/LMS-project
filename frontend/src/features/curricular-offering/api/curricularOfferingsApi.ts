import { getJson } from "@/lib/http";
import { CurricularOfferingCreateRequest, CurricularOfferingListResponse } from "./types";
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