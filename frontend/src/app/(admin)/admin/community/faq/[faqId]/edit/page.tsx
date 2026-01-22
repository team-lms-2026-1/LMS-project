import FaqEditPage from "@/features/community/faq/components/FaqEditPage";

export default function Page({ params }: { params: { faqId: string } }) {
  return <FaqEditPage faqId={params.faqId} />;
}
