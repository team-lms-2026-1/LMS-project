import { getJson } from "@/lib/http";
import {
  CurricularDetailFormResponse,
  CurricularOfferingCompetencyResponse,
  CurricularOfferingListResponse,
  CurricularOfferingStudentResponse,
} from "./types";

const BASE_URL = "/api/professor/curricular/offerings";

export type CurricularOfferingsListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
  semesterId?: number;
};

export type CurricularOfferingStudentsListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
};

export async function fetchCurricularOfferingsList(query: CurricularOfferingsListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);
  if (query.semesterId != null) sp.set("semesterId", String(query.semesterId));

  const qs = sp.toString();
  const url = qs ? `${BASE_URL}?${qs}` : BASE_URL;

  return getJson<CurricularOfferingListResponse>(url);
}

export async function fetchCurricularDetailForm(id: number) {
  return getJson<CurricularDetailFormResponse>(`${BASE_URL}/${id}/basic`, {
    cache: "no-store",
  });
}

export async function fetchCurricularOfferingCompetency(id: number) {
  return getJson<CurricularOfferingCompetencyResponse>(`${BASE_URL}/${id}/competency`, {
    cache: "no-store",
  });
}

export async function fetchCurricularOfferingStudentList(
  id: number,
  query: CurricularOfferingStudentsListQuery
) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);

  const qs = sp.toString();
  const base = `${BASE_URL}/${id}/students`;
  const url = qs ? `${base}?${qs}` : base;

  return getJson<CurricularOfferingStudentResponse>(url);
}
