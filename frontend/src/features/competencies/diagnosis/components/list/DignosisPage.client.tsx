"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./DignosisPage.module.css";
import { DiagnosisTable } from "./DiagnosisTable";
import { PaginationSimple, useListQuery } from "@/components/pagination";
import { SearchBar } from "@/components/searchbar";
import { Button } from "@/components/button";
import { fetchDiagnosisList } from "../../api/DiagnosisApi";
import type { DiagnosisListItemDto, PageMeta } from "../../api/types";
import { useRouter } from "next/navigation";

const DEFAULT_META: PageMeta = {
  page: 1,
  size: 20,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  sort: [],
};

export default function DignosisPageClient() {
  const router = useRouter();
  const { page, size, keyword, setPage, setKeyword } = useListQuery({ defaultPage: 1, defaultSize: 20 });
  const [inputKeyword, setInputKeyword] = useState("");
  const [items, setItems] = useState<DiagnosisListItemDto[]>([]);
  const [meta, setMeta] = useState<PageMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputKeyword(keyword ?? "");
  }, [keyword]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetchDiagnosisList({ page, size, keyword });
        if (!alive) return;
        setItems(res.data ?? []);
        setMeta(res.meta ?? DEFAULT_META);
      } catch (e: any) {
        if (!alive) return;
        setItems([]);
        setMeta(DEFAULT_META);
        setError(e?.message ?? "진단지 목록을 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [page, size, keyword]);

  const handleSearch = useCallback(() => {
    setKeyword(inputKeyword);
  }, [inputKeyword, setKeyword]);

  const handleCreate = () => {
    router.push("/admin/competencies/dignosis/new");
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/competencies/dignosis/${id}/edit`);
  };

  const handleDelete = (id: number) => {
    const ok = window.confirm("정말 삭제하시겠습니까?");
    if (!ok) return;
    setItems((prev) => prev.filter((item) => item.diagnosisId !== id));
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>진단지 관리</h1>

        <div className={styles.searchRow}>
          <div className={styles.searchBarWrap}>
            <SearchBar
              value={inputKeyword}
              onChange={setInputKeyword}
              onSearch={handleSearch}
              placeholder="검색어"
              onClear={() => setKeyword("")}
            />
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <DiagnosisTable items={items} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />

        <div className={styles.footerRow}>
          <div className={styles.footerCenter}>
            <PaginationSimple page={page} totalPages={meta.totalPages} onChange={setPage} disabled={loading} />
          </div>
          <div className={styles.footerRight}>
            <Button variant="primary" onClick={handleCreate}>
              등록
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
