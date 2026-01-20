import DepartmentDetailPage from "@/features/authority/departments/components/detail/DepartmentDetailPage";

type Props = {
  params: { departmentId: string };
};

export default function Page({ params }: Props) {
  return <DepartmentDetailPage departmentId={params.departmentId} />;
}
