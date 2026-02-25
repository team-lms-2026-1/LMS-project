
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PaginationSimple, useListQuery } from "@/components/pagination";
import { spacesApi } from "../../api/spacesApi";
import type { PageMeta, SpaceListItemDto } from "../../api/types";
import { SpacesTable } from "./SpacesTable";
import styles from "./SpacesPage.module.css";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

export default function SpacesPageClient() {
  const router = useRouter();
  const t = useI18n("studySpace.student.spaces.list");

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });

  const [rows, setRows] = useState<SpaceListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchList = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) {
        setLoading(true);
      }
      setError("");
      try {
        const res = await spacesApi.list({ page, size });
        setRows(res.data ?? []);
        setMeta(res.meta ?? null);
      } catch (e: any) {
        setError(e?.message || t("errors.loadFailed"));
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [page, size, t]
  );

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    const onFocus = () => fetchList({ silent: true });
    window.addEventListener("focus", onFocus);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchList({ silent: true });
      }
    }, 10000);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(intervalId);
    };
  }, [fetchList]);

  const onCardClick = (spaceId: number) => {
    const target = rows.find((item) => item.spaceId === spaceId);
    if (target && target.isRentable === false) {
      toast.error(t("errors.noRentableRooms"));
      return;
    }
    router.push(`/student/study-space/spaces/${spaceId}`);
  };

  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.breadcrumb}>
            {t("breadcrumb.home")} &gt; {t("breadcrumb.current")}
          </div>
          <h1 className={styles.title}>{t("title")}</h1>
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


