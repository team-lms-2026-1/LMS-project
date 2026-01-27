import ResourceDetailPage from "@/features/community/resources/components/ResourceDetailPage";

export default function Page({ params }: { params: { resourceId: string } }) {
  return <ResourceDetailPage resourceId={params.resourceId} />;
}
