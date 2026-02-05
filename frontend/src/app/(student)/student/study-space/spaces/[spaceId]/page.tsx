import SpacesDetailPageClient from "@/features/student/study-space/spaces/components/detail/SpacesDetailPage.client";

type Props = {
  params: { spaceId: string };
};

export default function Page({ params }: Props) {
  const spaceId = Number(params.spaceId);
  return <SpacesDetailPageClient spaceId={spaceId} />;
}
