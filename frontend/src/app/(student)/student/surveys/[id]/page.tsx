import StudentSurveyDetailPageClient from "@/features/admin/surveys/components/detail/StudentSurveyDetailPage.client";

export default function Page({ params }: { params: { id: string } }) {
    return <StudentSurveyDetailPageClient id={params.id} />;
}
