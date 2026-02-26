"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OutButton } from "@/components/button/OutButton";
import { Button } from "@/components/button";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { SemesterFilterDropdown } from "@/features/dropdowns/semesters/SemesterFilterDropdown";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { useCurricularOfferingsList } from "@/features/curricular-offering/hooks/useCurricularOfferingList";
import type { CurricularOfferingListItemDto } from "@/features/curricular-offering/api/types";
import { Table, type TableColumn } from "@/components/table";
import { StatusPill } from "@/components/status";
import { CurricularOfferingCreateModal } from "@/features/curricular-offering/components/modal/CurricularOfferingCreateModal";
import { useI18n } from "@/i18n/useI18n";
import pageStyles from "@/features/curricular-offering/components/list/CurricularOfferingsPage.module.css";
import tableStyles from "@/features/curricular-offering/components/list/CurricularOfferingsTable.module.css";

type TableProps = {
  items: CurricularOfferingListItemDto[];
  loading: boolean;
  onRowClick?: (row: CurricularOfferingListItemDto) => void;
};

function CurricularOfferingsTable({ items, loading, onRowClick }: TableProps) {
  const t = useI18n("curricular.adminOfferings.table");
  const tStatus = useI18n("curricular.status.offering");
  const tCommon = useI18n("curricular.common");

  const offeringStatusLabel = (value: string) => {
    switch (value) {
      case "DRAFT":
        return tStatus("DRAFT");
      case "OPEN":
        return tStatus("OPEN");
      case "ENROLLMENT_CLOSED":
        return tStatus("ENROLLMENT_CLOSED");
      case "IN_PROGRESS":
        return tStatus("IN_PROGRESS");
      case "COMPLETED":
        return tStatus("COMPLETED");
      case "CANCELED":
        return tStatus("CANCELED");
      default:
        return value;
    }
  };

  const columns: Array<TableColumn<CurricularOfferingListItemDto>> = [
    { header: t("offeringCode"), align: "center", render: (r) => r.offeringCode },
    { header: t("curricularName"), align: "center", render: (r) => r.curricularName },
    { header: t("capacity"), align: "center", render: (r) => r.capacity },
    { header: t("professorName"), align: "center", render: (r) => r.professorName },
    { header: t("semesterName"), align: "center", render: (r) => r.semesterName },
    { header: t("location"), align: "center", render: (r) => r.location },
    { header: t("credit"), align: "center", render: (r) => r.credit },
    {
      header: t("status"),
      align: "center",
      render: (r) => <StatusPill status={r.status as any} label={offeringStatusLabel(r.status)} />,
    },
    {
      header: tCommon("manageHeader"),
      width: 140,
      align: "center",
      stopRowClick: true,
      render: (r) => (
        <div className={tableStyles.manageCell}>
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onRowClick?.(r);
            }}
          >
            {tCommon("detailButton")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table<CurricularOfferingListItemDto>
      columns={columns}
      items={items}
      loading={loading}
      skeletonRowCount={10}
      rowKey={(r) => r.offeringId}
      emptyText={t("emptyText")}
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
    />
  );
}

export default function Page() {
  const router = useRouter();
  const { state, actions } = useCurricularOfferingsList();
  const t = useI18n("curricular.adminOfferings");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { get } = useFilterQuery(["semesterId"]);
  const semesterId = get("semesterId");

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });
  const [inputKeyword, setInputKeyword] = useState("");

  useEffect(() => {
    actions.goPage(page);
  }, [actions, page]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [actions, size, state.size]);

  useEffect(() => {
    actions.setSemesterId(semesterId ? Number(semesterId) : null);
  }, [actions, semesterId]);

  const handleSearch = useCallback(() => {
    setPage(1);
    actions.goPage(1);
    actions.setKeyword(inputKeyword);
  }, [actions, inputKeyword, setPage]);

  const handleCreated = async () => {
    await actions.reload();
  };

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.card}>
        <h1 className={pageStyles.title}>{t("title")}</h1>

        <div className={pageStyles.searchRow}>
          <SemesterFilterDropdown />
          <SearchBar
            value={inputKeyword}
            onChange={setInputKeyword}
            onSearch={handleSearch}
            placeholder={t("searchPlaceholder")}
          />
        </div>

        {state.error && <div className={pageStyles.errorMessage}>{state.error}</div>}

        <CurricularOfferingsTable
          items={state.items}
          loading={state.loading}
          onRowClick={(row) => router.push(`/admin/curricular/offerings/${row.offeringId}`)}
        />

        <div className={pageStyles.footerRow}>
          <PaginationSimple
            page={page}
            totalPages={state.meta.totalPages}
            onChange={setPage}
            disabled={state.loading}
          />
          <OutButton onClick={() => setIsModalOpen(true)}>
            {t("registerButton")}
          </OutButton>
        </div>

        <CurricularOfferingCreateModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={handleCreated}
        />
      </div>
    </div>
  );
}
