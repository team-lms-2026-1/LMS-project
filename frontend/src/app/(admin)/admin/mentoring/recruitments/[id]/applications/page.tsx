import MentoringApplicationList from "@/features/mentoring/components/MentoringApplicationList";

export default function Page({ params }: { params: { id: string } }) {
    return <MentoringApplicationList recruitmentId={Number(params.id)} />;
}
