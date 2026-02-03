// frontend/src/app/(admin)/admin/depts/[deptId]/page.tsx

"use client";

import DeptDetailPageClient from "@/features/authority/depts/components/detail/DeptDetailPage.client";

type PageProps = {
  params: { deptId: string };
};

export default function Page({ params }: PageProps) {
  return <DeptDetailPageClient deptId={params.deptId} />;
}
