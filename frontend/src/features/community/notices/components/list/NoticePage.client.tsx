"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./NoticePage.module.css";
import { NoticesTable } from "./NoticeTablePage";
import { useNoticesList } from "../../hooks/useNoticeList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { Button } from "@/components/button";
import { useRouter } from "next/navigation";

export default function NoticePageClient() {
  const router = useRouter();
  const { state, actions } = useNoticesList();

  const handleCreated = async () => {
    await actions.reload();
  };

  // pagination + search
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

  const goCreate = () => {
    // ✅ 등록 페이지 (요청 경로)
    router.push("/admin/community/notices/new");
  };

  const goCategoryManage = () => {
    // ✅ 카테고리 관리 주소 (프로젝트 라우트에 맞게 수정)
    router.push("/admin/community/notices/categories");
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>공지사항</h1>

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

        <NoticesTable items={state.items} loading={state.loading} onReload={actions.reload} />

        {/* ✅ footerRow: 왼쪽 카테고리 관리 / 가운데 페이지네이션 / 오른쪽 등록 */}
        <div className={styles.footerRow}>
          <div className={styles.footerLeft}>
            <Button variant="secondary" onClick={goCategoryManage}>
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

          <div className={styles.footerRight}>
            <Button variant="primary" onClick={goCreate}>
              등록
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
