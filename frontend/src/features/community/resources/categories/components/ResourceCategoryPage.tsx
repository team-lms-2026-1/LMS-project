"use client";

import CategoryManagerPage from "@/features/community/components/CategoryManagerPage";
import { resourceCategoriesApi } from "../api/resourceCategoriesApi";

export default function ResourceCategoryPage() {
  return (
    <CategoryManagerPage
      breadcrumb="커뮤니티 - 자료실 카테고리 관리"
      title="자료실"
      backTo="/admin/community/resources"
      api={resourceCategoriesApi}
    />
  );
}
