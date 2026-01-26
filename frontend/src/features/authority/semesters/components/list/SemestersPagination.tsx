"use client";

import type { PageMeta } from "@/features/authority/semesters/api/types";
import styles from "./SemestersPagination.module.css";

export function SemestersPagination({
  meta,
  onChangePage,
}: {
  meta: PageMeta | null;
  onChangePage: (page: number) => void;
}) {
  if (!meta) return null;
  
  const { page, totalPages, hasPrev, hasNext } = meta;

  return (
    <div className={styles.pagination}>
      <button
        className={styles.pageButton}
        disabled={!hasPrev}
        onClick={() => onChangePage(page - 1)}
      >
        &lt;
      </button>

      <span className={styles.pageInfo}>
        {page} / {totalPages}
      </span>

      <button
        className={styles.pageButton}
        disabled={!hasNext}
        onClick={() => onChangePage(page + 1)}
      >
        &gt;
      </button>
    </div>
  );
}
