"use client";

import { useCallback, useMemo, useState } from "react";
import styles from "./CategoryPage.module.css";

import type { Category, CategoryScope, CreateCategoryRequestDto, UpdateCategoryRequestDto } from "../../api/types";
import { categoriesApi } from "../../api/CategoriesApi";
import { useCategoryList } from "../../hooks/useCategoryList";

import { SearchBar } from "@/components/searchbar";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { Button } from "@/components/button";
import { useRouter } from "next/navigation";
import { CategoryTablePage } from "./CategoryTablePage";

const SCOPE_LABEL: Record<CategoryScope, string> = {
  notices: "공지사항",
  resources: "자료실",
  faqs: "FAQ",
  qna: "Q&A",
};

// “확인” 눌렀을 때 돌아갈 경로 (너 라우트에 맞게 수정 가능)
const BACK_PATH: Record<CategoryScope, string> = {
  notices: "/admin/community/notices",
  resources: "/admin/community/resources",
  faqs: "/admin/community/faqs",
  qna: "/admin/community/qna",
};

function normalizeHex(v: string) {
  const s = v.trim();
  if (!s) return "";
  return s.startsWith("#") ? s : `#${s}`;
}

export default function CategoryPageClient({ scope }: { scope: CategoryScope }) {
  const router = useRouter();

  const { state, actions } = useCategoryList(scope);

  // pagination + search (공용 pagination 컴포넌트와 연결)
  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });
  const [inputKeyword, setInputKeyword] = useState("");

  // 외부 pagination 상태 -> hook 상태 동기화
  // (useCategoryList가 내부 page/size를 가지고 있으니 actions로 반영)
  useMemo(() => {
    actions.goPage(page);
    if (state.size !== size) actions.setSize(size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  const handleSearch = useCallback(() => {
    setPage(1);
    actions.goPage(1);
    actions.setKeyword(inputKeyword);
  }, [inputKeyword, setPage, actions]);

  const onAddClick = useCallback(async () => {
    const name = prompt("카테고리 이름을 입력하세요.");
    if (!name?.trim()) return;

    const bg = normalizeHex(prompt("배경색 HEX를 입력하세요. 예) #F3F4F6") ?? "");
    if (!bg) return;

    const text = normalizeHex(prompt("글자색 HEX를 입력하세요. 예) #111827") ?? "");
    if (!text) return;

    const body: CreateCategoryRequestDto = {
      name: name.trim(),
      bgColorHex: bg,
      textColorHex: text,
    };

    try {
      await categoriesApi.create(scope, body);
      await actions.reload();
    } catch (e: any) {
      alert(e?.message ?? "카테고리 생성 실패");
    }
  }, [scope, actions]);

  const onEditClick = useCallback(
    async (item: Category) => {
      const name = prompt("카테고리 이름", item.name);
      if (!name?.trim()) return;

      const bg = normalizeHex(prompt("배경색 HEX", item.bgColorHex) ?? "");
      if (!bg) return;

      const text = normalizeHex(prompt("글자색 HEX", item.textColorHex) ?? "");
      if (!text) return;

      const body: UpdateCategoryRequestDto = {
        name: name.trim(),
        bgColorHex: bg,
        textColorHex: text,
      };

      try {
        await categoriesApi.update(scope, item.categoryId, body);
        await actions.reload();
      } catch (e: any) {
        alert(e?.message ?? "카테고리 수정 실패");
      }
    },
    [scope, actions]
  );

  const onDeleteClick = useCallback(
    async (item: Category) => {
      const ok = confirm(`"${item.name}" 카테고리를 삭제할까요?`);
      if (!ok) return;

      try {
        await categoriesApi.remove(scope, item.categoryId);
        await actions.reload();
      } catch (e: any) {
        alert(e?.message ?? "카테고리 삭제 실패");
      }
    },
    [scope, actions]
  );

  const title = `${SCOPE_LABEL[scope]} 관리`;

  const onConfirm = () => {
    router.push(BACK_PATH[scope]);
  };

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
          scope={scope}
          items={state.items}
          loading={state.loading}
          onReload={actions.reload}
        />

        <div className={styles.bottomRow}>
          <div className={styles.pagination}>
            <PaginationSimple
              page={page}
              totalPages={state.meta.totalPages}
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
