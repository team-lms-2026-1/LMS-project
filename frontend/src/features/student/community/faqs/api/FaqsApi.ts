import { getJson } from "@/lib/http";
import { FaqListResponse } from "./types";

export type FaqsListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
};

export async function fetchFaqsList(query: FaqsListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);

  const qs = sp.toString();
  const url = qs ? `/api/student/community/faqs?${qs}` : `/api/student/community/faqs`;

  return getJson<FaqListResponse>(url);
}

export async function fetchFaqDetail(faqId: number) {
  return getJson<any>(`/api/student/community/faqs/${faqId}`);
}