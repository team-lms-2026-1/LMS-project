
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PaginationSimple, useListQuery } from "@/components/pagination";
import { spacesApi } from "../../api/SpacesApi";
import type { PageMeta, SpaceListItemDto } from "../../api/types";
import { SpacesTable } from "./SpacesTable";
import styles from "./SpacesPage.module.css";

export default function SpacesPageClient() {
  const router = useRouter();

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 8 });

  const [rows, setRows] = useState<SpaceListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await spacesApi.list({ page, size });
        if (!alive) return;

        setRows(res.data ?? []);
        setMeta(res.meta ?? null);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "목록 조회 중 오류가 발생했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [page, size]);

  const onCardClick = (spaceId: number) => {
    router.push(`/student/study-space/spaces/${spaceId}`);
  };

  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.breadcrumb}>🏠 &gt; 학습공간 대여 관리</div>
          <h1 className={styles.title}>학습공간 대여 관리</h1>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <SpacesTable items={rows} loading={loading} onCardClick={onCardClick} />

      <div className={styles.bottomRow}>
        <div className={styles.paginationWrap}>
            <PaginationSimple page={page} totalPages={totalPages} onChange={(p) => setPage(p)} />
        </div>

        </div>
    </div>
  );
}
