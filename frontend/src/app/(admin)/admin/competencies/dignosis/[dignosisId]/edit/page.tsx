import DignosisEditPageClient from "@/features/admin/competencies/diagnosis/components/modal/edit/DignosisEditPage.client";

type Props = {
  params: { dignosisId: string };
};

export default function Page({ params }: Props) {
  return <DignosisEditPageClient dignosisId={params.dignosisId} />;
}
