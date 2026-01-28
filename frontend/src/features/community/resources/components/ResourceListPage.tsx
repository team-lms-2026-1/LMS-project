"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "../styles/resource-list.module.css";
import { resourcesApi } from "../api/resourcesApi";
import type { ResourceListItemDto } from "../api/dto";
import { resourceCategoriesApi } from "../categories/api/resourceCategoriesApi";
import type { ResourceCategoryDto } from "../categories/api/dto";

import { Button } from "@/components/button";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { SearchBar } from "@/components/searchbar/SearchBar";
import { Table } from "@/components/table/Table";
import type { TableColumn } from "@/components/table/types";

type CategoryFilterValue = "ALL" | string; // ✅ select는 string 기반

function CategoryBadge({ name, bgColor, textColor }: { name: string; bgColor: string; textColor: string }) {
  return (
    <span className={styles.badge} style={{ backgroundColor: bgColor, color: textColor }}>
      {name}
    </span>
  );
}

export default function ResourceListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [categoryId, setCategoryId] = useState<CategoryFilterValue>("ALL");
  const [keyword, setKeyword] = useState("");

  const [rows, setRows] = useState<ResourceListItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<ResourceCategoryDto[]>([]);
  const categoryMap = useMemo(() => {
    const m = new Map<string, ResourceCategoryDto>();
    categories.forEach((c) => m.set(String(c.categoryId), c));
    return m;
  }, [categories]);

  // ✅ PaginationSimple은 1-base
  const initialPage = useMemo(() => {
    const v = Number(searchParams.get("page") ?? "1");
    return Number.isFinite(v) && v >= 1 ? v : 1;
  }, [searchParams]);

  const [page, setPage] = useState<number>(initialPage);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  // ✅ API는 0-base
  const apiPage = Math.max(0, page - 1);
  const size = 20;

  // ✅ (임시) totalPages: API 응답 meta 붙으면 교체
  const totalPages = 10;

  const fetchCategories = async () => {
    try {
      const data = await resourceCategoriesApi.list({ page: 0, size: 200 });
      setCategories(data);
    } catch {
      setCategories([]);
    }
  };

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const cid = categoryId === "ALL" ? undefined : Number(categoryId);
      const params =
        cid && Number.isFinite(cid)
          ? { categoryId: cid, keyword, page: apiPage, size }
          : { keyword, page: apiPage, size };

      const data = await resourcesApi.list(params);
      setRows(data);
    } catch (e: any) {
      setError(e?.message ?? "자료실 목록 조회 실패");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ page 바뀌면 재조회
  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPage]);

  const filteredRows = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return rows.filter((r) => {
      const cOk = categoryId === "ALL" ? true : String(r.categoryId) === String(categoryId);
      const kOk = kw.length === 0 ? true : (r.title ?? "").toLowerCase().includes(kw);
      return cOk && kOk;
    });
  }, [rows, categoryId, keyword]);

  // ✅ PaginationSimple onChange: state + URL 동기화
  const onChangePage = (nextPage: number) => {
    const safe = Math.max(1, Math.min(nextPage, totalPages));
    setPage(safe);

    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(safe));
    router.replace(`${pathname}?${sp.toString()}`);
  };

  // ✅ Table columns
  const columns: Array<TableColumn<ResourceListItemDto>> = useMemo(
    () => [
      {
        header: "번호",
        width: 90,
        align: "center",
        render: (row, idx) => row.no ?? String(apiPage * size + idx + 1).padStart(5, "0"),
      },
      {
        header: "분류",
        width: 140,
        align: "center",
        render: (row) => {
          const c = categoryMap.get(String(row.categoryId));
          const badgeName = row.categoryName ?? c?.name ?? "-";
          const bg = c?.bgColorHex ?? "#64748b";
          const tc = c?.textColorHex ?? "#ffffff";

          return <CategoryBadge name={badgeName} bgColor={bg} textColor={tc} />;
        },
      },
      {
        header: "제목",
        align: "left",
        render: (row) => <span title={row.title}>{row.title}</span>,
      },
      {
        header: "조회수",
        width: 110,
        align: "center",
        render: (row) => Number(row.views ?? 0).toLocaleString(),
      },
      {
        header: "작성일",
        width: 140,
        align: "center",
        render: (row) => row.createdAt ?? "-",
      },
    ],
    [apiPage, size, categoryMap]
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>&gt;</span>
        <strong>자료실 관리</strong>
      </div>

      <div className={styles.header}>
        <div className={styles.title}>자료실</div>

        <div className={styles.filters}>
          <select
            className={styles.select}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={loading}
          >
            <option value="ALL">전체</option>
            {categories.map((c) => (
              <option key={String(c.categoryId)} value={String(c.categoryId)}>
                {c.name}
              </option>
            ))}
          </select>

          <SearchBar
            value={keyword}
            onChange={setKeyword}
            onSearch={fetchList}
            placeholder="검색어 입력..."
            loading={loading}
            allowEmptySearch={true}
            searchOnEnter={true}
            showClear={true}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <Table<ResourceListItemDto>
          columns={columns}
          items={filteredRows}
          rowKey={(row) => String(row.id)}
          onRowClick={(row) => router.push(`/admin/community/resources/${row.id}`)}
          loading={loading}
          skeletonRowCount={8}
          emptyText={error ? error : "검색 결과가 없습니다."}
          ariaLabel="자료실 목록"
        />
      </div>

      <div className={styles.footer}>
        <Button variant="secondary" onClick={() => router.push("/admin/community/resources/categories")}>
          카테고리 관리
        </Button>

        <div className={styles.pagination}>
          <PaginationSimple page={page} totalPages={totalPages} onChange={onChangePage} disabled={loading} />
        </div>

        <Button variant="primary" onClick={() => router.push("/admin/community/resources/new")}>
          등록
        </Button>
      </div>
    </div>
  );
}
