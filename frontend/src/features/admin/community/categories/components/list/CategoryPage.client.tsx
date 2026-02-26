"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./CategoryPage.module.css";
import type { CategoryScope } from "../../api/types";
import { useCategoryList } from "../../hooks/useCategoryList";

import { SearchBar } from "@/components/searchbar";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { Button } from "@/components/button";
import { CategoryTablePage, type CategoryTablePageHandle } from "./CategoryTablePage";
import { useI18n } from "@/i18n/useI18n";

const BACK_PATH: Record<CategoryScope, string> = {
  notices: "/admin/community/notices",
  resources: "/admin/community/resources",
  faqs: "/admin/community/faqs",
  qna: "/admin/community/qna",
};

export default function CategoryPageClient({ scope }: { scope: CategoryScope }) {
  const router = useRouter();
  const t = useI18n("community.categories.page");

  const { state, actions } = useCategoryList(scope);

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });
  const [inputKeyword, setInputKeyword] = useState("");

  // child table의 편집 상태/토스트를 제어하기 위한 ref
  const tableRef = useRef<CategoryTablePageHandle | null>(null);

  useEffect(() => {
    actions.goPage(page);
    if (state.size !== size) actions.setSize(size);
  }, [page, size, actions, state.size]);

  const handleSearch = useCallback(() => {
    setPage(1);
    actions.goPage(1);
    actions.setKeyword(inputKeyword);
  }, [inputKeyword, setPage, actions]);

  const scopeLabel = t(`scopes.${scope}`);
  const title = t("title", { scope: scopeLabel });

  const onConfirm = useCallback(() => {
    // 편집 중이면 이동하지 않고 토스트만 표시
    if (tableRef.current?.isDirty()) {
      tableRef.current.showLeaveToast();
      return;
    }

    const url = `${BACK_PATH[scope]}?categoriesUpdated=1&ts=${Date.now()}`;

    router.push(url);

    setTimeout(() => {
      router.refresh();
    }, 0);
  }, [router, scope]);

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <span className={styles.homeIcon}>{t("breadcrumbHome")}</span>
        <span className={styles.sep}>&gt;</span>
        <strong>{title}</strong>
      </div>

      <div className={styles.card}>
        <div className={styles.headerRow}>
          <h1 className={styles.pageTitle}>{scopeLabel}</h1>

          <div className={styles.searchWrap}>
            <SearchBar
              value={inputKeyword}
              onChange={setInputKeyword}
              onSearch={handleSearch}
              placeholder={t("searchPlaceholder")}
            />
          </div>
        </div>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <CategoryTablePage
          ref={tableRef}   
          scope={scope}
          items={state.items}
          loading={state.loading}
          onReload={actions.reload}
        />

        <div className={styles.bottomRow}>
          <div className={styles.pagination}>
            <PaginationSimple
              page={page}
              totalPages={state.meta?.totalPages ?? 1}
              onChange={setPage}
              disabled={state.loading}
            />
          </div>

          <div className={styles.confirmWrap}>
            <Button variant="primary" onClick={onConfirm}>
              {t("confirmButton")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
