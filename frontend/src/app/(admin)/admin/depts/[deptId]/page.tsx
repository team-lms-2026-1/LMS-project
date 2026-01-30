import DeptDetailPageClient from "@/features/authority/depts/components/detail/DeptDetailPage.client";

export default function Page({ params }: { params: { deptId: string } }) {
  return <DeptDetailPageClient deptId={params.deptId} />;
}
