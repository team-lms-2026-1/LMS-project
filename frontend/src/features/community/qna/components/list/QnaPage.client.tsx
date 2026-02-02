"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./QnaPage.module.css";
import { QnaTable } from "./QnaTablePage";
import { useQnaList } from "../../hooks/useQnaList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { Button } from "@/components/button";

export default function QnaPageClient() {
  const router = useRouter();
  const { state, actions } = useQnaList();

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });
  const [inputKeyword, setInputKeyword] = useState("");

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

  const goCategories = () => {
    router.push("/admin/community/qna/categories");
  };

  const handleDelete = useCallback(
    async (questionId: number) => {
      const ok = confirm("이 질문을 삭제할까요?");
      if (!ok) return;

      try {
        await actions.deleteQuestion(questionId); // hook에 있어야 함
        await actions.reload();
      } catch (e: any) {
        alert(e?.message ?? "삭제 중 오류가 발생했습니다.");
      }
    },
    [actions]
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Q&A</h1>

        <div className={styles.searchRow}>
          <div className={styles.searchBarWrap}>
            <SearchBar
              value={inputKeyword}
              onChange={setInputKeyword}
              onSearch={handleSearch}
              placeholder="제목 검색"
            />
          </div>
        </div>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <QnaTable items={state.items} loading={state.loading} onDeleteClick={handleDelete} />

        {/* ✅ 자료실과 동일한 footerRow 구조로 통일 */}
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

          {/* ✅ QnA는 등록 버튼이 없으니 오른쪽은 빈 영역(레이아웃 정렬용) */}
          <div className={styles.footerRight} />
        </div>
      </div>
    </div>
  );
}
