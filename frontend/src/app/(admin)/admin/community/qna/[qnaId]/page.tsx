import QnaDetailPage from "@/features/community/qna/questions/components/QnaDetailPage";

export default function Page({ params }: { params: { qnaId: string } }) {
  return <QnaDetailPage qnaId={params.qnaId} />;
}
