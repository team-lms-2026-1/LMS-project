// src/features/community/resources/categories/components/ResourceCategoryPage.tsx
import CategoryManagerPage from "@/features/community/components/CategoryManagerPage";

export default function ResourceCategoryPage() {
  return (
    <CategoryManagerPage
      breadcrumb="커뮤니티 - 자료실 카테고리 관리"
      pageTitle="자료실"
      confirmHref="/admin/community/resources"
      basePath="/api/admin/community/resources/categories"
    />
  );
}
