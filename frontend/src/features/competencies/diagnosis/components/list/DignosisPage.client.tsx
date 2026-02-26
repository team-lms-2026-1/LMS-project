"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";
import styles from "./DignosisPage.module.css";
import { Button } from "@/components/button";
import { SearchBar } from "@/components/searchbar";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { deleteJson } from "@/lib/http";
import { fetchDiagnosisList } from "../../api/DiagnosisApi";
import type { DiagnosisListItemDto, PageMeta } from "../../api/types";
import { DiagnosisTable } from "./DiagnosisTable";
import DignosisDeleteModal from "../modal/delete/DignosisDeleteModal.client";

const DEFAULT_META: PageMeta = {
  page: 1,
  size: 10,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

export default function DignosisPageClient() {
  const t = useI18n("competency.adminDiagnosis.list");
  const router = useRouter();
  const { page, size, keyword, setPage, setKeyword } = useListQuery({ defaultPage: 1, defaultSize: 10 });
  const [inputKeyword, setInputKeyword] = useState("");
  const [items, setItems] = useState<DiagnosisListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DiagnosisListItemDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const deleteTitle = useMemo(() => deleteTarget?.title, [deleteTarget]);

  useEffect(() => {
    setInputKeyword(keyword ?? "");
  }, [keyword]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetchDiagnosisList({ page, size, keyword });
        if (!alive) return;
        setItems(res.data ?? []);
        setMeta(res.meta ?? DEFAULT_META);
      } catch (e: any) {
        if (!alive) return;
        setItems([]);
        setMeta(DEFAULT_META);
        setError(e?.message ?? t("messages.listLoadFallback"));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [keyword, page, size, t]);

  const handleSearch = useCallback(() => {
    setKeyword(inputKeyword);
  }, [inputKeyword, setKeyword]);

  const handleCreate = () => {
    router.push("/admin/competencies/dignosis/new");
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/competencies/dignosis/${id}/edit`);
  };

  const handleDelete = (id: number) => {
    const target = items.find((item) => item.diagnosisId === id) ?? null;
    if (!target) {
      toast.error(t("messages.targetNotFound"));
      return;
    }
    setDeleteTarget(target);
  };

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget || deleteLoading) return;
    setDeleteLoading(true);

    try {
      await deleteJson(`/api/admin/competencies/dignosis/${deleteTarget.diagnosisId}`);
      setItems((prev) => prev.filter((item) => item.diagnosisId !== deleteTarget.diagnosisId));
      setDeleteTarget(null);
      toast.success(t("messages.deleteSuccess"));
    } catch (e: any) {
      toast.error(e?.message ?? t("messages.deleteFailed"));
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteLoading, deleteTarget, t]);

  const handleDeleteClose = useCallback(() => {
    if (deleteLoading) return;
    setDeleteTarget(null);
  }, [deleteLoading]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("title")}</h1>

        <div className={styles.searchRow}>
          <div className={styles.searchBarWrap}>
            <SearchBar
              value={inputKeyword}
              onChange={setInputKeyword}
              onSearch={handleSearch}
              placeholder={t("searchPlaceholder")}
              onClear={() => setKeyword("")}
            />
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <DiagnosisTable items={items} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />

        <div className={styles.footerRow}>
          <div className={styles.footerCenter}>
            <PaginationSimple page={page} totalPages={meta.totalPages} onChange={setPage} disabled={loading} />
          </div>
          <div className={styles.footerRight}>
            <Button variant="primary" onClick={handleCreate}>
              {t("buttons.create")}
            </Button>
          </div>
        </div>
      </div>

      <DignosisDeleteModal
        open={Boolean(deleteTarget)}
        targetTitle={deleteTitle}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteClose}
      />
    </div>
  );
}
