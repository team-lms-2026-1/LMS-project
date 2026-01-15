import QnaEditPage from "@/features/community/qna/components/QnaEditPage";

export default function Page({ params }: { params: { qnaId: string } }) {
  return <QnaEditPage qnaId={params.qnaId} />;
}
