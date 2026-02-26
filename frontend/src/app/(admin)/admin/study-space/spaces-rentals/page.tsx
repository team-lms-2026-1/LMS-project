"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { useI18n } from "@/i18n/useI18n";
import { rentalsApi } from "@/features/study-space/spaces-rentals/api/rentalsApi";
import type { PageMeta, RentalDto } from "@/features/study-space/spaces-rentals/api/types";
import ApproveModal from "@/features/study-space/spaces-rentals/components/modal/ApproveModal";
import RejectedModal from "@/features/study-space/spaces-rentals/components/modal/RejectedModal";
import RentalsTable from "@/features/study-space/spaces-rentals/components/list/RentalsTable";
import styles from "@/features/study-space/spaces-rentals/components/list/RentalsPage.module.css";

export default function RentalsListPage() {
  const t = useI18n("studySpace.admin.rentals.list");
  const tHook = useI18n("studySpace.admin.rentals.hook");

  const { page, size, keyword, setPage, setKeyword } = useListQuery({
    defaultPage: 1,
    defaultSize: 10,
  });

  const [inputKeyword, setInputKeyword] = useState(keyword ?? "");
  const [rows, setRows] = useState<RentalDto[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [approveId, setApproveId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setInputKeyword(keyword ?? "");
  }, [keyword]);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await rentalsApi.list({
          page,
          size,
          keyword: keyword?.trim() || undefined,
        });
        if (!alive) return;
        setRows(res.data ?? []);
        setMeta(res.meta ?? null);
      } catch (e: any) {
        if (!alive) return;
        const status = e?.status;
        const msg =
          typeof status === "number"
            ? tHook("errors.listWithStatus", { status })
            : tHook("errors.list");
        setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [page, size, keyword, tHook]);

  const onSearch = () => {
    setKeyword(inputKeyword.trim());
  };

  const refresh = async () => {
    try {
      const res = await rentalsApi.list({
        page,
        size,
        keyword: keyword?.trim() || undefined,
      });
      setRows(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch {
      // Ignore refresh errors; main effect handles error state.
    }
  };

  const handleApprove = async () => {
    if (!approveId) return;
    setProcessing(true);
    try {
      await rentalsApi.approve(approveId);
      toast.success(tHook("toasts.approved"));
      await refresh();
      setApproveId(null);
    } catch (e: any) {
      const status = e?.status;
      const msg =
        typeof status === "number"
          ? tHook("errors.processWithStatus", { status })
          : tHook("errors.process");
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectId) return;
    setProcessing(true);
    try {
      await rentalsApi.reject(rejectId, reason);
      toast.success(tHook("toasts.rejected"));
      await refresh();
      setRejectId(null);
    } catch (e: any) {
      const status = e?.status;
      const msg =
        typeof status === "number"
          ? tHook("errors.processWithStatus", { status })
          : tHook("errors.process");
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.leftGroup}>
          <div className={styles.breadcrumb}>{t("breadcrumb.current")}</div>
          <h1 className={styles.title}>{t("title")}</h1>
        </div>

        <div className={styles.searchBar}>
          <input
            className={styles.searchInput}
            value={inputKeyword}
            onChange={(e) => setInputKeyword(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
          />
          <button className={styles.searchBtn} type="button" onClick={onSearch} disabled={loading}>
            검색
          </button>
        </div>
      </div>

      {error && <div style={{ marginBottom: 12, color: "#b91c1c" }}>{error}</div>}

      <div className={styles.tableCard}>
        <div className={styles.tableBorderWrap}>
          <RentalsTable
            data={rows}
            loading={loading}
            onApprove={(id) => setApproveId(id)}
            onReject={(id) => setRejectId(id)}
          />
        </div>
      </div>

      <div className={styles.paginationFooter}>
        <PaginationSimple page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <ApproveModal
        open={approveId !== null}
        onClose={() => {
          if (!processing) setApproveId(null);
        }}
        onConfirm={handleApprove}
        loading={processing}
      />

      <RejectedModal
        open={rejectId !== null}
        onClose={() => {
          if (!processing) setRejectId(null);
        }}
        onConfirm={handleReject}
      />
    </div>
  );
}
