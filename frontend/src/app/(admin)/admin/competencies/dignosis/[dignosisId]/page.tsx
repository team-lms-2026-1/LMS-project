import DignosisDetailPageClient from "@/features/admin/competencies/diagnosis/components/modal/detail/DignosisDetailPage.client";

type Props = {
  params: { dignosisId: string };
};

export default function Page({ params }: Props) {
  return <DignosisDetailPageClient dignosisId={params.dignosisId} />;
}
