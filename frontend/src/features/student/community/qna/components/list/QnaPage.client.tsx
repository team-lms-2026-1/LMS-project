"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import styles from "./QnaPage.module.css";
import { QnaTable } from "./QnaTablePage";
import { useQnaList } from "../../hooks/useQnaList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { useI18n } from "@/i18n/useI18n";

export default function QnaPageClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const t = useI18n("community.qna.student.list");

  const toastOnceRef = useRef<string | null>(null);
  const { state, actions } = useQnaList();

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });
  const [inputKeyword, setInputKeyword] = useState("");

  useEffect(() => {
    actions.goPage(page);
  }, [page, actions]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [size, state.size, actions]);

  useEffect(() => {
    const toastType = sp.get("toast");
    if (!toastType) return;
    if (toastOnceRef.current === toastType) return;
    toastOnceRef.current = toastType;

    if (toastType === "created") toast.success(t("toasts.created"), { id: "qna-toast-created" });
    else if (toastType === "updated") toast.success(t("toasts.updated"), { id: "qna-toast-updated" });
    else if (toastType === "deleted") toast.success(t("toasts.deleted"), { id: "qna-toast-deleted" });

    const next = new URLSearchParams(sp.toString());
    next.delete("toast");
    const qs = next.toString();
    router.replace(qs ? `/student/community/qna/questions?${qs}` : "/student/community/qna/questions");
  }, [sp, router, t]);

  const handleSearch = useCallback(() => {
    setPage(1);
    actions.goPage(1);
    actions.setKeyword(inputKeyword);
  }, [inputKeyword, setPage, actions]);

  const handleCreate = () => {
    router.push("/student/community/qna/questions/new");
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.topRow}>
          <h1 className={styles.title}>{t("title")}</h1>

          <div className={styles.rightControls}>
            <div className={styles.searchBarWrap}>
              <SearchBar
                value={inputKeyword}
                onChange={setInputKeyword}
                onSearch={handleSearch}
                placeholder={t("searchPlaceholder")}
              />
            </div>
          </div>
        </div>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <QnaTable items={state.items} loading={state.loading} />

        <div className={styles.footerRow}>
          <PaginationSimple
            page={page}
            totalPages={state.meta.totalPages}
            onChange={setPage}
            disabled={state.loading}
          />
          <button type="button" className={styles.createBtn} onClick={handleCreate}>
            {t("createButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
