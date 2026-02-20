"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./QnaPage.module.css";
import { QnaTable } from "./QnaTablePage";
import { useQnaList } from "../../hooks/useQnaList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import toast from "react-hot-toast";

export default function QnaPageClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const toastOnceRef = useRef<string | null>(null);
  const { state, actions } = useQnaList();

  // 학생 화면에서는 작성/수정 관련 별도 모달 상태를 사용하지 않음
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

  useEffect(() => {
    const t = sp.get("toast");
    if (!t) return;
    if (toastOnceRef.current === t) return;
    toastOnceRef.current = t;

    if (t === "created") toast.success("질문이 등록되었습니다.", { id: "qna-toast-created" });
    else if (t === "updated") toast.success("질문이 수정되었습니다.", { id: "qna-toast-updated" });
    else if (t === "deleted") toast.success("질문이 삭제되었습니다.", { id: "qna-toast-deleted" });

    const next = new URLSearchParams(sp.toString());
    next.delete("toast");
    const qs = next.toString();
    router.replace(qs ? `/student/community/qna/questions?${qs}` : "/student/community/qna/questions");
  }, [sp, router]);

  const handleSearch = useCallback(() => {
    setPage(1);
    actions.goPage(1);
    actions.setKeyword(inputKeyword);
  }, [inputKeyword, setPage, actions]);

  const handleCreate = () => {
    // 질문 등록 페이지로 이동
    router.push("/student/community/qna/questions/new");
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* 제목 + 검색 + 등록 버튼 */}
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
