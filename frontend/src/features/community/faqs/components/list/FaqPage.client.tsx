"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./FaqPage.module.css";
import { FaqsTable } from "./FaqTablePage";
import { useFaqsList } from "../../hooks/useFaqList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { Button } from "@/components/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Dropdown } from "@/features/dropdowns/_shared/Dropdown";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { fetchFaqCategories } from "../../api/FaqsApi";
import type { Category } from "../../api/types";
import toast from "react-hot-toast";

export default function FaqPageClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const { state, actions } = useFaqsList();
  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });
  const [inputKeyword, setInputKeyword] = useState("");
  const { get, setFilters } = useFilterQuery(["categoryId"]);
  const categoryIdQs = get("categoryId"); 
  const [categories, setCategories] = useState<Category[]>([]);
  const [catsLoading, setCatsLoading] = useState(false);
  const toastOnceRef = useRef<string | null>(null);

  useEffect(() => {
    const t = sp.get("toast");
    if (!t) return;

    if (toastOnceRef.current === t) return;
    toastOnceRef.current = t;

    if (t === "created") toast.success("FAQ가 등록되었습니다.", { id: "faq-toast-created" });
    else if (t === "updated") toast.success("FAQ가 수정되었습니다.", { id: "faq-toast-updated" });
    else if (t === "deleted") toast.success("FAQ가 삭제되었습니다.", { id: "faq-toast-deleted" });

    const next = new URLSearchParams(sp.toString());
    next.delete("toast");

    const qs = next.toString();
    router.replace(qs ? `/admin/community/faqs?${qs}` : "/admin/community/faqs");
  }, [sp, router]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setCatsLoading(true);
      try {
        const res = await fetchFaqCategories();
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

  const goCreate = () => {
    router.push("/admin/community/faqs/new");
  };

  const goCategoryManage = () => {
    router.push("/admin/community/faqs/categories");
  };

  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({ value: String(c.categoryId), label: c.name }));
  }, [categories]);

  const onChangeCategory = (nextValue: string) => {
    setFilters({ categoryId: nextValue || null });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>FAQ</h1>

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

        <FaqsTable items={state.items} loading={state.loading} onReload={actions.reload} />

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
