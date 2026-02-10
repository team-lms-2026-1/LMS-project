import DeptDetailPageClient from "@/features/authority/depts/components/detail/DeptDetailPage.client";

type Props = {
  params: { deptId: string };
};

export default function Page({ params }: Props) {
  return <DeptDetailPageClient deptId={params.deptId} />;
}
