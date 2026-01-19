import NoticeEditPage from "@/features/community/notices/components/NoticeEditPage";

export default function Page({ params }: { params: { noticeId: string } }) {
  return <NoticeEditPage noticeId={params.noticeId} />;
}
