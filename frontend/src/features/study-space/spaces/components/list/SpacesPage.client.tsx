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

export default function SpacesPageClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const toastOnceRef = useRef<string | null>(null);

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 8 });

  const [rows, setRows] = useState<SpaceListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const t = sp.get("toast");
    if (!t) return;

    if (toastOnceRef.current === t) return;
    toastOnceRef.current = t;

    if (t === "created") toast.success("학습공간이 등록되었습니다.", { id: "spaces-toast-created" });
    else if (t === "updated") toast.success("학습공간이 수정되었습니다.", { id: "spaces-toast-updated" });
    else if (t === "deleted") toast.success("학습공간이 삭제되었습니다.", { id: "spaces-toast-deleted" });

    const next = new URLSearchParams(sp.toString());
    next.delete("toast");

    const qs = next.toString();
    router.replace(qs ? `/admin/study-space/spaces?${qs}` : "/admin/study-space/spaces");
  }, [sp, router]);

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

        <div className={styles.createWrap}>
          <Button className={styles.createBtn} variant="primary" onClick={onClickCreate}>
            등록
          </Button>
        </div>
      </div>
    </div>
  );
}
