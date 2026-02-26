"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./StudentCompetencyPage.module.css";
import { StudetnCompetencytable } from "./StudetnCompetencytable";
import { useSClist } from "@/features/admin/competencies/scai/hooks/useSClist";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { Dropdown } from "@/features/dropdowns/_shared/Dropdown";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { useI18n } from "@/i18n/useI18n";

export default function StudentCompetencyPageClient() {
  const t = useI18n("competency.adminStudents");
  const { state, actions } = useSClist();
  const { page, size, keyword: keywordQs, setPage, setKeyword: setKeywordQs } = useListQuery({
    defaultPage: 1,
    defaultSize: 10,
  });
  const { get, setFilters } = useFilterQuery(["deptName"]);
  const deptNameQs = get("deptName");

  const [inputKeyword, setInputKeyword] = useState("");

  useEffect(() => {
    setInputKeyword(keywordQs ?? "");
  }, [keywordQs]);

  useEffect(() => {
    if (state.page !== page) actions.goPage(page);
  }, [page, state.page, actions]);

  useEffect(() => {
    if (state.size !== size) actions.setSize(size);
  }, [size, state.size, actions]);

  useEffect(() => {
    const nextKeyword = keywordQs ?? "";
    if (state.keyword !== nextKeyword) actions.setKeyword(nextKeyword);
  }, [keywordQs, state.keyword, actions]);

  useEffect(() => {
    const nextDeptName = deptNameQs ?? "";
    if (state.deptName !== nextDeptName) actions.setDeptName(nextDeptName);
  }, [deptNameQs, state.deptName, actions]);

  useEffect(() => {
    const reloadSilently = () => {
      actions.reload({ silent: true });
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        reloadSilently();
      }
    };

    window.addEventListener("focus", reloadSilently);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", reloadSilently);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [actions]);

  const handleSearch = useCallback(() => {
    setKeywordQs(inputKeyword);
  }, [inputKeyword, setKeywordQs]);

  const deptOptions = useMemo(() => {
    const map = new Map<string, string>();
    state.items.forEach((item) => {
      if (!item.deptName) return;
      map.set(item.deptName, item.deptName);
    });
    return Array.from(map.keys())
      .sort()
      .map((d) => ({ value: d, label: d }));
  }, [state.items]);

  const onChangeDept = (nextValue: string) => {
    setFilters({ deptName: nextValue || null });
  };

  const filteredItems = useMemo(() => {
    const dept = (deptNameQs ?? "").trim();
    const kw = (keywordQs ?? "").trim();
    const lowered = kw.toLowerCase();

    return state.items.filter((item) => {
      if (dept && item.deptName !== dept) return false;
      if (!kw) return true;
      return (
        item.name?.toLowerCase?.().includes(lowered) ||
        item.studentNumber?.includes(kw) ||
        item.deptName?.toLowerCase?.().includes(lowered)
      );
    });
  }, [state.items, deptNameQs, keywordQs]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("title")}</h1>

        <div className={styles.searchRow}>
          <div className={styles.searchGroup}>
            <div className={styles.dropdownWrap}>
              <Dropdown value={deptNameQs} options={deptOptions} placeholder={t("filters.all")} onChange={onChangeDept} />
            </div>

            <div className={styles.searchBarWrap}>
              <SearchBar
                value={inputKeyword}
                onChange={setInputKeyword}
                onSearch={handleSearch}
                placeholder={t("filters.keywordPlaceholder")}
                onClear={() => setKeywordQs("")}
              />
            </div>
          </div>
        </div>

        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        <StudetnCompetencytable items={filteredItems} loading={state.loading} />

        <div className={styles.footerRow}>
          <div className={styles.footerCenter}>
            <PaginationSimple
              page={page}
              totalPages={state.meta.totalPages}
              onChange={setPage}
              disabled={state.loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
