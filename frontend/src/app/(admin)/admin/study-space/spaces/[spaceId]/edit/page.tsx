import SpacesEditPageClient from "@/features/admin/study-space/spaces/components/edit/SpacesEditPage.client";

type Props = {
  params: { spaceId: string };
};

export default function Page({ params }: Props) {
  return <SpacesEditPageClient spaceId={Number(params.spaceId)} />;
}
