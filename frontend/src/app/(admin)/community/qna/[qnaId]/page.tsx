import QnaDetailPage from "@/features/community/qna/components/QnaDetailPage";

export default function Page({ params }: { params: { qnaId: string } }) {
  return <QnaDetailPage qnaId={params.qnaId} />;
}
