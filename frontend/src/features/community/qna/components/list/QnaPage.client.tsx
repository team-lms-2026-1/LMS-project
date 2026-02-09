"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./QnaPage.module.css";
import { QnaTable } from "./QnaTablePage";
import { useQnaList } from "../../hooks/useQnaList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { Button } from "@/components/button";
import { Dropdown } from "@/features/dropdowns/_shared/Dropdown";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";

import { fetchQnaCategories } from "../../api/QnasApi";
import type { Category } from "../../api/types";
import toast from "react-hot-toast";
import DeleteModal from "../modal/DeleteModal.client";

export default function QnaPageClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const { state, actions } = useQnaList();

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });

  const { get, setFilters } = useFilterQuery(["categoryId"]);
  const categoryIdQs = get("categoryId");

  const [inputKeyword, setInputKeyword] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [catsLoading, setCatsLoading] = useState(false);
  const toastOnceRef = useRef<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const t = sp.get("toast");
    if (!t) return;

    if (toastOnceRef.current === t) return;
    toastOnceRef.current = t;

    if (t === "created") toast.success("Q&A가 등록되었습니다.", { id: "qna-toast-created" });
    else if (t === "updated") toast.success("Q&A가 수정되었습니다.", { id: "qna-toast-updated" });
    else if (t === "deleted") toast.success("Q&A가 삭제되었습니다.", { id: "qna-toast-deleted" });

    const next = new URLSearchParams(sp.toString());
    next.delete("toast");

    const qs = next.toString();
    router.replace(qs ? `/admin/community/qna?${qs}` : "/admin/community/qna");
  }, [sp, router]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setCatsLoading(true);
      try {
        const res = await fetchQnaCategories();
        if (!alive) return;
        setCategories(res.data ?? []);
      } finally {
        if (alive) setCatsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const v = categoryIdQs ? Number(categoryIdQs) : null;
    actions.setCategoryId(v);
  }, [categoryIdQs, actions]);

  useEffect(() => {
    actions.goPage(page);
  }, [page, actions]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [size, state.size, actions]);

  const handleSearch = useCallback(() => {
    setPage(1);
    actions.goPage(1);
    actions.setKeyword(inputKeyword);
  }, [inputKeyword, setPage, actions]);

  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({ value: String(c.categoryId), label: c.name }));
  }, [categories]);

  const onChangeCategory = (nextValue: string) => {
    setPage(1);
    setFilters({ categoryId: nextValue || null });
  };

  const goCategories = () => {
    router.push("/admin/community/qna/categories");
  };

  const handleDelete = useCallback((questionId: number) => {
    const target = state.items.find((q) => q.questionId === questionId);
    setDeleteTarget({ id: questionId, title: target?.title });
  }, [state.items]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await actions.deleteQuestion(deleteTarget.id);
      toast.success("Q&A가 삭제되었습니다.");
      setDeleteTarget(null);
    } catch (e: any) {
      toast.error(e?.message ?? "삭제 실패");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, actions]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Q&A</h1>

        <div className={styles.searchRow}>
          <div className={styles.searchGroup}>
            <div className={styles.dropdownWrap}>
              <Dropdown
                value={categoryIdQs || ""}
                options={categoryOptions}
                placeholder="전체"
                loading={catsLoading}
                disabled={catsLoading}
                onChange={onChangeCategory}
              />
            </div>

            <div className={styles.searchBarWrap}>
              <SearchBar
                value={inputKeyword}
                onChange={setInputKeyword}
                onSearch={handleSearch}
                placeholder="제목 검색"
              />
            </div>
          </div>
        </div>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <QnaTable items={state.items} loading={state.loading} onDeleteClick={handleDelete} />

        <div className={styles.footerRow}>
          <div className={styles.footerLeft}>
            <Button variant="secondary" onClick={goCategories}>
              카테고리 관리
            </Button>
          </div>

          <div className={styles.footerCenter}>
            <PaginationSimple
              page={page}
              totalPages={state.meta.totalPages}
              onChange={setPage}
              disabled={state.loading}
            />
          </div>

          <div className={styles.footerRight} />
        </div>
      </div>

      <DeleteModal
        open={!!deleteTarget}
        targetLabel="Q&A"
        targetTitle={deleteTarget?.title}
        loading={deleting}
        onClose={() => {
          if (deleting) return;
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
