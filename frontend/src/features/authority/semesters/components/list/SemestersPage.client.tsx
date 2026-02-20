"use client";

import { useEffect, useState } from "react";
import { useSemestersList } from "@/features/authority/semesters/hooks/useSemesterList";

import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SemestersTable } from "./SemestersTable";
import { SemesterCreateModal } from "../modal/SemesterCreateModal";
import styles from "./SemestersPage.client.module.css";
import { SemesterEditModal } from "../modal/SemesterEditModal";
import { OutButton } from "@/components/button/OutButton";
import { useI18n } from "@/i18n/useI18n";

export default function SemestersPageClient() {
  const { state, actions } = useSemestersList();
  const t = useI18n("authority.semesters.page");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const handleCreated = async () => {
    await actions.reload();
  };


  // URL query based page/size
  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });

  // pagination
  useEffect(() => {
    actions.goPage(page);
  }, [page, actions]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [size, state.size, actions]);
  
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("title")}</h1>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <SemestersTable
          items={state.items}
          loading={state.loading}
          onEditClick={(id) => setEditId(id)}
        />

        <div className={styles.footerRow}>
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

        {/* 생성 핸들러 + open 상태 제어 (상위 컴포넌트) */}
        <SemesterCreateModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={handleCreated}
        />
        <SemesterEditModal
          open={Boolean(editId)}
          semesterId={editId ?? undefined}
          onClose={() => setEditId(null)}
          onUpdated={async () => {
            await actions.reload();
            setEditId(null);
          }}
        />
      </div>
    </div>
  );
}
