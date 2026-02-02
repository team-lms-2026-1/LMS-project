"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./QnaPage.module.css";
import { QnaTable } from "./QnaTablePage";
import { useQnaList } from "../../hooks/useQnaList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";

export default function QnaPageClient() {
  const router = useRouter();
  const { state, actions } = useQnaList();

  // 지금 학생화면이면 아래 두 개는 사실 필요 없음(남겨도 동작은 함)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const handleCreated = async () => {
    await actions.reload();
  };

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });
  const [inputKeyword, setInputKeyword] = useState("");

  useEffect(() => {
    actions.goPage(page);
  }, [page]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [size, state.size]);

  const handleSearch = useCallback(() => {
    setPage(1);
    actions.goPage(1);
    actions.setKeyword(inputKeyword);
  }, [inputKeyword, setPage, actions]);

  const handleCreate = () => {
    // ✅ 질문 등록 페이지로 이동 (폴더 구조에 맞게 경로만 조정하면 됨)
    router.push("/student/community/qna/questions/new");
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* ✅ 제목 + 검색 + 등록 버튼 한 줄 */}
        <div className={styles.topRow}>
          <h1 className={styles.title}>Q&A</h1>

          <div className={styles.rightControls}>
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

        <QnaTable items={state.items} loading={state.loading} onEditClick={(id) => setEditId(id)} />

        <div className={styles.footerRow}>
          <PaginationSimple
            page={page}
            totalPages={state.meta.totalPages}
            onChange={setPage}
            disabled={state.loading}
          />
          <button type="button" className={styles.createBtn} onClick={handleCreate}>
          질문 등록
        </button>
        </div>
        
      </div>
    </div>
  );
}
