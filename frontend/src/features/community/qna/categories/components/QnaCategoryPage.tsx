"use client";

import CategoryManagerPage from "@/features/community/components/CategoryManagerPage";
import { qnaCategoriesApi } from "../api/qnaCategoriesApi";

export default function QnaCategoryPage() {
  return (
    <CategoryManagerPage
      breadcrumb="커뮤니티 - Q&A 카테고리 관리"
      title="Q&A"
      backTo="/admin/community/qna"
      api={qnaCategoriesApi}
    />
  );
}
