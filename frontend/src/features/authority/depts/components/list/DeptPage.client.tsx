"use client"

import { useCallback, useEffect, useState } from "react";
import styles from "./DeptPage.module.css"
import { DeptsTable } from "./DeptTable";
import { OutButton } from "@/components/button/OutButton";
import { useDeptList } from "../../hooks/useDeptList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";

import DeptCreatePage from "../modal/DeptCreatePage";
import DeptEditPage from "../modal/DeptEditPage";
import { updateDeptStatus } from "../../api/deptsApi";

export default function DeptPageClient() {
  const { state, actions } = useDeptList();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const handleCreated = async () => {
    await actions.reload();
    setPage(1);
  };
  const handleUpdated = async () => {
    await actions.reload();
  };
  const handleToggleStatus = async (deptId: number, nextActive: boolean) => {
    try {
      await updateDeptStatus(deptId, nextActive);
      await actions.reload();
    } catch (e: any) {
      console.error(e);
      // 백엔드에서 409 Conflict (연관 데이터 존재 시 비활성 불가) 반환 시 처리
      if (e?.response?.status === 409 || e?.status === 409 || e?.statusCode === 409) {
        alert("교수, 학생, 전공 등 연관 데이터가 존재하는 학과는 사용을 중지할 수 없습니다.");
      } else {
        // 기타 오류
        alert("상태 변경 중 오류가 발생했습니다.");
      }
      // 상태 롤백(UI 리로드) - 이미 catch 전에 await updateDeptStatus가 실패하면 reload 안되지만
      // UI상 토글이 멋대로 바뀌어 있을 수 있으므로 reload 호출 추천, 하지만 await 필요하므로 여기서 호출
      await actions.reload();
    }
  };

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });

  const [inputKeyword, setInputKeyword] = useState("");

  useEffect(() => {
    actions.goPage(page);
  }, [page, actions]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [size, state.size, actions]);

  // deptId 드롭다운 필터추가
  const handleSearch = useCallback(() => {
    const nextKeyword = inputKeyword.trim();
    actions.setKeyword(nextKeyword);
  }, [inputKeyword, actions]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>학과 관리</h1>

        <div className={styles.searchRow}>
          <div className={styles.searchBarWrap}>
            <SearchBar
              value={inputKeyword}
              onChange={setInputKeyword}
              onSearch={handleSearch}
              placeholder="학과코드/학과명 검색"
            />

          </div>
        </div>
        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <DeptsTable
          items={state.items}
          loading={state.loading}
          onEditClick={(id) => setEditId(id)}
          onToggleStatus={handleToggleStatus}
        />


        <div className={styles.footerRow}>
          <PaginationSimple
            page={page}
            totalPages={state.meta.totalPages}
            onChange={setPage}
            disabled={state.loading}
          />
          <OutButton onClick={() => setIsModalOpen(true)}>
            학과등록
          </OutButton>
        </div>
      </div>
      {isModalOpen && (
        <DeptCreatePage
          onClose={() => setIsModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
      {editId !== null && (
        <DeptEditPage
          deptId={editId}
          onClose={() => setEditId(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  )
}