import ResourceEditPage from "@/features/community/resources/components/ResourceEditPage";

export default function Page({ params }: { params: { resourceId: string } }) {
  return <ResourceEditPage resourceId={params.resourceId} />;
}
