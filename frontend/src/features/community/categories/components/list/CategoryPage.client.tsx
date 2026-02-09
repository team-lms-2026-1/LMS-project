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

const SCOPE_LABEL: Record<CategoryScope, string> = {
  notices: "공지사항",
  resources: "자료실",
  faqs: "FAQ",
  qna: "Q&A",
};

const BACK_PATH: Record<CategoryScope, string> = {
  notices: "/admin/community/notices",
  resources: "/admin/community/resources",
  faqs: "/admin/community/faqs",
  qna: "/admin/community/qna",
};

export default function CategoryPageClient({ scope }: { scope: CategoryScope }) {
  const router = useRouter();

  const { state, actions } = useCategoryList(scope);

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });
  const [inputKeyword, setInputKeyword] = useState("");

  // ✅ 테이블(자식)에서 편집중 여부/토스트를 호출하기 위한 ref
  const tableRef = useRef<CategoryTablePageHandle | null>(null);

  useEffect(() => {
    actions.goPage(page);
    if (state.size !== size) actions.setSize(size);
  }, [page, size]);

  const handleSearch = useCallback(() => {
    setPage(1);
    actions.goPage(1);
    actions.setKeyword(inputKeyword);
  }, [inputKeyword, setPage, actions]);

  const title = `${SCOPE_LABEL[scope]} 관리`;

  const onConfirm = useCallback(() => {
    // ✅ 편집중이면: 이동 막고 토스트
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
        <span className={styles.homeIcon}>⌂</span>
        <span className={styles.sep}>&gt;</span>
        <strong>{title}</strong>
      </div>

      <div className={styles.card}>
        <div className={styles.headerRow}>
          <h1 className={styles.pageTitle}>{SCOPE_LABEL[scope]}</h1>

          <div className={styles.searchWrap}>
            <SearchBar
              value={inputKeyword}
              onChange={setInputKeyword}
              onSearch={handleSearch}
              placeholder="검색어 입력..."
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
              확인
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
