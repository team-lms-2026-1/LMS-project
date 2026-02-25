"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { useI18n } from "@/i18n/useI18n";
import styles from "./StudentCurricularCurrentEnrollmentPage.module.css";
import type { CurricularEnrollmentListItemDto } from "../../api/types";
import { StudentCurrentEnrollmentsTable } from "./StudentCurrentEnrollmentsTable";
import { useCurricularCurrentEnrollmentsList } from "../../hooks/useCurricularCurrentEnrollmentList";

export default function StudentCurricularCurrentEnrollmentPageClient() {
  const router = useRouter();
  const { state, actions } = useCurricularCurrentEnrollmentsList();
  const t = useI18n("curricular.studentCurrentEnrollments");

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });

  useEffect(() => {
    actions.goPage(page);
  }, [page, actions]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [size, state.size, actions]);

  const handleRowClick = useCallback(
    (row: CurricularEnrollmentListItemDto) => {
      router.push(`/student/curricular/offerings/${row.offeringId}`);
    },
    [router]
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("title")}</h1>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <StudentCurrentEnrollmentsTable
          items={state.items}
          loading={state.loading}
          onRowClick={handleRowClick}
        />

        <div className={styles.footerRow}>
          <PaginationSimple
            page={page}
            totalPages={state.meta.totalPages}
            onChange={setPage}
            disabled={state.loading}
          />
        </div>
      </div>
    </div>
  );
}
