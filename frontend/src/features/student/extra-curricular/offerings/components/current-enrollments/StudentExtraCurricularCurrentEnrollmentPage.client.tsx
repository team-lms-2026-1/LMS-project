"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { useI18n } from "@/i18n/useI18n";
import styles from "./StudentExtraCurricularCurrentEnrollmentPage.module.css";
import type { ExtraCurricularEnrollmentListItemDto } from "../../api/types";
import { StudentExtraCurrentEnrollmentsTable } from "./StudentExtraCurrentEnrollmentsTable";
import { useStudentExtraCurricularCurrentEnrollmentsList } from "../../hooks/useExtraCurricularOfferingList";

export default function StudentExtraCurricularCurrentEnrollmentPageClient() {
  const router = useRouter();
  const { state, actions } = useStudentExtraCurricularCurrentEnrollmentsList();
  const t = useI18n("extraCurricular.studentCurrentEnrollments");

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });

  useEffect(() => {
    actions.goPage(page);
  }, [page, actions]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [size, state.size, actions]);

  const handleRowClick = useCallback(
    (row: ExtraCurricularEnrollmentListItemDto) => {
      router.push(`/student/extra-curricular/offerings/${row.extraOfferingId}`);
    },
    [router]
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("title")}</h1>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <StudentExtraCurrentEnrollmentsTable
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
