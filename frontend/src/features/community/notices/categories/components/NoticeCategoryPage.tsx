import CategoryManagerPage from "@/features/community/components/CategoryManagerPage";

export default function NoticeCategoryPage() {
  return (
    <CategoryManagerPage
      breadcrumb="커뮤니티 - 공지사항 카테고리 관리"
      pageTitle="공지사항"
      confirmHref="/admin/community/notices"
      basePath="/api/admin/community/notices/categories"
    />
  );
}
