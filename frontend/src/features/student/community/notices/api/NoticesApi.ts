import { getJson } from "@/lib/http";
import { NoticeListResponse } from "./types";

export type NotiesListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
};

export async function fetchNoticesList(query: NotiesListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);

  const qs = sp.toString();
  const url = qs ? `/api/student/community/notices?${qs}` : `/api/student/community/notices`;

  return getJson<NoticeListResponse>(url);
}
