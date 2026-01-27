"use client";

import CategoryManagerPage from "@/features/community/components/CategoryManagerPage";
import { faqCategoriesApi } from "../api/faqCategoriesApi";

export default function FaqCategoryPage() {
  return (
    <CategoryManagerPage
      breadcrumb="커뮤니티 - FAQ 카테고리 관리"
      title="FAQ"
      backTo="/admin/community/faq"
      api={faqCategoriesApi}
    />
  );
}
