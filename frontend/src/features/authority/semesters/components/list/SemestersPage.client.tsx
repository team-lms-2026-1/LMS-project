"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSemestersList } from "@/features/authority/semesters/hooks/useSemesterList";
import { SemestersSearchBar } from "./SemestersSearchBar";
import { SemestersTable } from "./SemestersTable";
import { SemestersPagination } from "./SemestersPagination";
import { SemesterCreateModal } from "../modal/SemesterCreateModal";
import styles from "./SemestersPage.client.module.css";

export default function SemestersPageClient() {
  const router = useRouter();
  const { state, actions } = useSemestersList();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreated = async () => {
    await actions.reload();
    setIsModalOpen(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>학기 관리</h1>

        <SemestersSearchBar
          keyword={state.keyword}
          onChangeKeyword={actions.setKeyword}
          onSearch={actions.search}
        />

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <SemestersTable
          items={state.items}
          loading={state.loading}
          onRowClick={(id) => router.push(`/admin/semesters/${id}`)}
          onEditClick={(id) => router.push(`/admin/semesters/${id}`)}
        />

        <div className={styles.footerRow}>
          <SemestersPagination meta={state.meta} onChangePage={actions.goPage} />
          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => setIsModalOpen(true)}
          >
            학기등록
          </button>
        </div>

        {/* ✅ 항상 렌더 + open으로 제어 (팀 표준) */}
        <SemesterCreateModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={handleCreated}
        />
      </div>
    </div>
  );
}
