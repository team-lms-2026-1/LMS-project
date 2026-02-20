import DignosisDeletePageClient from "@/features/competencies/diagnosis/components/modal/delete/DignosisDeletePage.client";

type Props = {
  params: { dignosisId: string };
};

export default function Page({ params }: Props) {
  return <DignosisDeletePageClient dignosisId={params.dignosisId} />;
}
