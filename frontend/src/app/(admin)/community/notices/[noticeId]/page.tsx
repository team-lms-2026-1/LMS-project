import NoticeDetailPage from "@/features/community/notices/components/NoticeDetailPage";

export default function Page({ params }: { params: { noticeId: string } }) {
  return <NoticeDetailPage noticeId={params.noticeId} />;
}
