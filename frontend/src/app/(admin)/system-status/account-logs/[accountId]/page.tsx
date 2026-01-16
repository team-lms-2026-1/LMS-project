import AccountLogDetailPage from "@/features/systemStatus/accountLogs/components/AccountLogDetailPage";

type Props = { params: { accountId: string } };

export default function Page({ params }: Props) {
  return <AccountLogDetailPage accountId={params.accountId} />;
}
