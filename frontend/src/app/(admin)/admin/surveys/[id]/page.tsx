import SurveyDetailPageClient from "@/features/admin/surveys/components/detail/SurveyDetailPage.client";

export default function Page({ params }: { params: { id: string } }) {
    return <SurveyDetailPageClient id={params.id} />;
}
