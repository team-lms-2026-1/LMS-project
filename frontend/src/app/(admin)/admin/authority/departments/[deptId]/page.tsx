import DepartmentDetailPage from "@/features/admin/authority/departments/components/detail/DepartmentDetailPage";

type Props = {
  params: { deptId: string };
};

export default function Page({ params }: Props) {
  return <DepartmentDetailPage deptId={Number(params.deptId)} />;
}
