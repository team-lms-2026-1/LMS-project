import { getJson } from "@/lib/http";
import { ResourceListResponse } from "./types";

export type ResourcesListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
};

export async function fetchResourcesList(query: ResourcesListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);

  const qs = sp.toString();
  const url = qs ? `/api/student/community/resources?${qs}` : `/api/student/community/resources`;

  return getJson<ResourceListResponse>(url);
}
