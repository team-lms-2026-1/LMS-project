import DepartmentDetailPage from "@/features/authority/departments/components/detail/DepartmentDetailPage";

type Props = {
  params: { deptId: string };
};

export default function Page({ params }: Props) {
  return <DepartmentDetailPage deptId={Number(params.deptId)} />;
}
