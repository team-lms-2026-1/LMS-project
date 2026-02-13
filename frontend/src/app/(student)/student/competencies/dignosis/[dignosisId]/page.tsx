import DignosisDetailPageClient from "@/features/student/competencies/dignosis/components/modal/detail/DignosisDetailPage.client";

type Props = {
  params: { dignosisId: string };
};

export default function Page({ params }: Props) {
  return <DignosisDetailPageClient dignosisId={params.dignosisId} />;
}
