import MentoringApplicationList from "@/features/admin/mentoring/components/MentoringApplicationList";

export default function Page({ params }: { params: { id: string } }) {
    return <MentoringApplicationList recruitmentId={Number(params.id)} />;
}
