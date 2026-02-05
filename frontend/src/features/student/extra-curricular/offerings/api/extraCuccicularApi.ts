import { getJson } from "@/lib/http";
import { SuccessResponse } from "@/features/curricular/api/types";
import { ExtraCurricularOfferingDetailResponse, ExtraCurricularOfferingUserListResponse } from "./types";

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
