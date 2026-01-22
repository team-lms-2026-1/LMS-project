import FaqDetailPage from "@/features/community/faq/components/FaqDetailPage";

export default function Page({ params }: { params: { faqId: string } }) {
  return <FaqDetailPage faqId={params.faqId} />;
}
