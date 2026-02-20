"use client";

import { Table, type TableColumn } from "@/components/table";
import { StatusPill } from "@/components/status";
import styles from "./ExtraCompletionDetailTable.module.css";
import { useLocale } from "@/hooks/useLocale";
import { useI18n } from "@/i18n/useI18n";
import { localizeSemesterOptionLabel } from "@/features/dropdowns/semesters/localeLabel";

import type { ExtraCompletionListItemDto } from "../../../../api/types";

type Props = {
  items: ExtraCompletionListItemDto[];
  loading: boolean;
};

export function ExtraCompletionDetailTable({ items, loading }: Props) {
  const { locale } = useLocale();
  const t = useI18n("extraCurricular.adminGrades.detail.table");
  const tCompletion = useI18n("curricular.status.completion");

  const columns: Array<TableColumn<ExtraCompletionListItemDto>> = [
    {
      header: t("semester"),
      align: "center",
      render: (r) => localizeSemesterOptionLabel(r.semesterName, locale),
    },
    { header: t("extraOfferingCode"), align: "center", render: (r) => r.extraOfferingCode },
    { header: t("extraOfferingName"), align: "center", render: (r) => r.extraOfferingName },
    { header: t("points"), align: "center", render: (r) => r.rewardPointDefault },
    { header: t("recognizedHours"), align: "center", render: (r) => r.recognizedHoursDefault },
    {
      header: t("completionStatus"),
      align: "center",
      render: (r) => (
        <StatusPill
          status={r.completionStatus as any}
          label={tCompletion(r.completionStatus as any)}
        />
      ),
    },
  ];

  return (
    <Table<ExtraCompletionListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.applicationId}
      emptyText={t("emptyText")}
    />
  );
}
