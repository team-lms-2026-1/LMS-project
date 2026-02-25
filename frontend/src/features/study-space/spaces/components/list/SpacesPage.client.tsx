"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PaginationSimple, useListQuery } from "@/components/pagination";
import { spacesApi } from "../../api/spacesApi";
import type { PageMeta, SpaceListItemDto } from "../../api/types";
import { SpacesTable } from "./SpacesTable";
import styles from "./SpacesPage.module.css";
import { Button } from "@/components/button";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

export default function SpacesPageClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const toastOnceRef = useRef<string | null>(null);
  const t = useI18n("studySpace.admin.spaces.list");

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });

  const [rows, setRows] = useState<SpaceListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const toastType = sp.get("toast");
    if (!toastType) return;

    if (toastOnceRef.current === toastType) return;
    toastOnceRef.current = toastType;

    if (toastType === "created") toast.success(t("toasts.created"), { id: "spaces-toast-created" });
    else if (toastType === "updated") toast.success(t("toasts.updated"), { id: "spaces-toast-updated" });
    else if (toastType === "deleted") toast.success(t("toasts.deleted"), { id: "spaces-toast-deleted" });

    const next = new URLSearchParams(sp.toString());
    next.delete("toast");

    const qs = next.toString();
    router.replace(qs ? `/admin/study-space/spaces?${qs}` : "/admin/study-space/spaces");
  }, [sp, router, t]);

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
        setError(e?.message || t("errors.loadFailed"));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [page, size, t]);

  const onCardClick = (spaceId: number) => {
    router.push(`/admin/study-space/spaces/${spaceId}`);
  };

  const onClickCreate = () => {
    router.push("/admin/study-space/spaces/new");
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

        <div className={styles.createWrap}>
          <Button className={styles.createBtn} variant="primary" onClick={onClickCreate}>
            {t("buttons.create")}
          </Button>
        </div>
      </div>
    </div>
  );
}


