// src/features/community/faqs/categories/components/FaqCategoryPage.tsx
import CategoryManagerPage from "@/features/community/components/CategoryManagerPage";

export default function FaqCategoryPage() {
  return (
    <CategoryManagerPage
      breadcrumb="커뮤니티 - FAQ 카테고리 관리"
      pageTitle="FAQ"
      confirmHref="/admin/community/faqs"
      basePath="/api/admin/community/faqs/categories"
    />
  );
}
