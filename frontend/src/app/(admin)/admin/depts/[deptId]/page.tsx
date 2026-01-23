// 위치: frontend/src/app/(admin)/admin/depts/[deptId]/page.tsx

"use client";

import DeptDetailPage from "@/features/authority/depts/components/detail/DeptDetailPage";

type PageProps = {
  params: {
    deptId: string;
  };
};

/**
 * 학과 상세 페이지 라우트
 * URL: /admin/depts/[deptId]
 */
export default function Page({ params }: PageProps) {
  const { deptId } = params;

  return <DeptDetailPage deptId={deptId} />;
}
