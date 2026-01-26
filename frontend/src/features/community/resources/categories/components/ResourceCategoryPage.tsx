"use client";

import CategoryManagerPage from "@/features/community/components/CategoryManagerPage";
import { resourceCategoriesApi } from "../api/resourceCategoriesApi";
import type { ResourceCategoryDto } from "../api/dto";
import type { CategoryApi, CategoryRow } from "@/features/community/types/category";

function toCategoryRow(r: ResourceCategoryDto): CategoryRow {
  return {
    categoryId: r.categoryId,
    name: r.name,
    bgColor: r.bgColorHex,
    textColor: r.textColorHex,
    postCount: r.postCount,
    latestCreatedAt: r.latestCreatedAt,
  };
}

function toCreateBody(row: Omit<CategoryRow, "categoryId" | "postCount" | "latestCreatedAt">) {
  return { name: row.name, bgColorHex: row.bgColor, textColorHex: row.textColor };
}

const apiAdapter: CategoryApi = {
  async list(params) {
    const rows = await resourceCategoriesApi.list(params);
    return rows.map(toCategoryRow);
  },
  async create(body) {
    const created = await resourceCategoriesApi.create(toCreateBody(body));
    return toCategoryRow(created);
  },
  async update(categoryId, body) {
    const updated = await resourceCategoriesApi.update(categoryId, toCreateBody(body));
    return toCategoryRow(updated);
  },
  async remove(categoryId) {
    return resourceCategoriesApi.remove(categoryId);
  },
};

export default function ResourceCategoryPage() {
  return (
    <CategoryManagerPage
      breadcrumb="커뮤니티 - 자료실 카테고리 관리"
      title="자료실"
      backTo="/admin/community/resources"
      api={apiAdapter}
    />
  );
}
