import SurveyStatsPageClient from "@/features/surveys/components/stats/SurveyStatsPage.client";

export default function Page({ params }: { params: { id: string } }) {
    return <SurveyStatsPageClient id={params.id} />;
}
