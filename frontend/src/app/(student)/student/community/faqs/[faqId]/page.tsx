import FaqDetailPage from "@/features/community/faqs/components/FaqDetailPage";

export default function Page({ params }: { params: { faqId: string } }) {
  return <FaqDetailPage faqId={params.faqId} />;
}
