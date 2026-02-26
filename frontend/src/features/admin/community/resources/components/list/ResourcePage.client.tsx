"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import styles from "./ResourcePage.module.css";
import { ResourcesTable } from "./ResourceTablePage";
import { useResourcesList } from "../../hooks/useResourceList";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { Button } from "@/components/button";
import { useRouter, useSearchParams } from "next/navigation";

import { Dropdown } from "@/features/dropdowns/_shared/Dropdown";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";

import { fetchResourceCategories } from "../../api/resourcesApi";
import type { Category } from "../../api/types";
import { useI18n } from "@/i18n/useI18n";

export default function ResourcePageClient() {
  const router = useRouter();
  const t = useI18n("community.resources.admin.list");
  const { state, actions } = useResourcesList();

  const { page, size, setPage } = useListQuery({ defaultPage: 1, defaultSize: 10 });

  const { get, setFilters } = useFilterQuery(["categoryId"]);
  const categoryIdQs = get("categoryId");

  const [inputKeyword, setInputKeyword] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [catsLoading, setCatsLoading] = useState(false);
  const sp = useSearchParams();
  const toastOnceRef = useRef<string | null>(null);

  useEffect(() => {
    const toastType = sp.get("toast");
    if (!toastType) return;
    if (toastOnceRef.current === toastType) return;
    toastOnceRef.current = toastType;
    if (toastType === "created") toast.success(t("toasts.created"), { id: "resource-toast-created" });
    else if (toastType === "updated") toast.success(t("toasts.updated"), { id: "resource-toast-updated" });
    else if (toastType === "deleted") toast.success(t("toasts.deleted"), { id: "resource-toast-deleted" });
    const next = new URLSearchParams(sp.toString());
    next.delete("toast");
    const qs = next.toString();
    router.replace(qs ? `/admin/community/resources?${qs}` : "/admin/community/resources");
  }, [sp, router, t]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setCatsLoading(true);
      try {
        const res = await fetchResourceCategories();
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

  // URL categoryId -> hook 반영
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

  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({ value: String(c.categoryId), label: c.name }));
  }, [categories]);

  const onChangeCategory = (nextValue: string) => {
    setPage(1);
    setFilters({ categoryId: nextValue || null });
  };

  const goCreate = () => router.push("/admin/community/resources/new");
  const goCategoryManage = () => router.push("/admin/community/resources/categories");

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("title")}</h1>

        <div className={styles.searchRow}>
          <div className={styles.searchGroup}>
            <div className={styles.dropdownWrap}>
              <Dropdown
                value={categoryIdQs || ""}
                options={categoryOptions}
                placeholder={t("categoryAll")}
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
                placeholder={t("searchPlaceholder")}
              />
            </div>
          </div>
        </div>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <ResourcesTable items={state.items} loading={state.loading} onReload={actions.reload} />

        <div className={styles.footerRow}>
          <div className={styles.footerLeft}>
            <Button variant="secondary" onClick={goCategoryManage}>
              {t("categoryManageButton")}
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
              {t("createButton")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
