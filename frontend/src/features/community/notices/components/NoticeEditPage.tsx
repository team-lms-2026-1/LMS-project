"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "../styles/notice-list.module.css";
import { noticesApi } from "../api/noticesApi";
import type { NoticeListItemDto } from "../api/dto";
import { noticeCategoriesApi } from "../categories/api/noticeCategoriesApi";
import type { NoticeCategoryRow } from "../categories/types";

import { Button } from "@/components/button";
import { PaginationSimple } from "@/components/pagination/PaginationSimple";
import { SearchBar } from "@/components/searchbar/SearchBar";
import { Table } from "@/components/table/Table";
import type { TableColumn } from "@/components/table/types";

export default function NoticeListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<NoticeCategoryRow[]>([]);
  const [categoryId, setCategoryId] = useState<number | "ALL">("ALL");
  const [keyword, setKeyword] = useState("");

  const [rows, setRows] = useState<NoticeListItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ PaginationSimple은 1-base
  const initialPage = useMemo(() => {
    const v = Number(searchParams.get("page") ?? "1");
    return Number.isFinite(v) && v >= 1 ? v : 1;
  }, [searchParams]);

  const [page, setPage] = useState<number>(initialPage);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  // ✅ API는 0-base로 변환해서만 사용
  const apiPage = Math.max(0, page - 1);
  const size = 20;

  // ✅ (임시) totalPages: API 응답 meta 붙으면 교체
  const totalPages = 10;

  const categoryById = useMemo(() => {
    const m = new Map<number, NoticeCategoryRow>();
    for (const c of categories) m.set(Number(c.categoryId), c);
    return m;
  }, [categories]);

  const categoryByName = useMemo(() => {
    const m = new Map<string, NoticeCategoryRow>();
    for (const c of categories) {
      if (!c?.name) continue;
      m.set(String(c.name), c);
    }
    return m;
  }, [categories]);

  const selectedCategoryName = useMemo(() => {
    if (categoryId === "ALL") return null;
    return categoryById.get(categoryId)?.name ?? null;
  }, [categoryId, categoryById]);

  const fetchCategories = async () => {
    try {
      const list = await noticeCategoriesApi.list({ page: 0, size: 50 });
      setCategories(Array.isArray(list) ? list : []);
    } catch {
      setCategories([]);
    }
  };

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await noticesApi.list({
        categoryId: categoryId === "ALL" ? undefined : categoryId,
        keyword,
        page: apiPage,
        size,
      });
      setRows(data);
    } catch (e: any) {
      setError(e?.message ?? "공지사항 목록 조회 실패");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchCategories();
      await fetchList();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ page 바뀌면 목록 다시 로드
  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPage]);

  // ✅ 프론트에서 한 번 더 안전하게 필터링(기존 유지)
  const filteredRows = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return rows.filter((n) => {
      const categoryOk =
        categoryId === "ALL"
          ? true
          : selectedCategoryName
            ? String(n.categoryName ?? "") === selectedCategoryName
            : true;

      const keywordOk = kw.length === 0 ? true : String(n.title ?? "").toLowerCase().includes(kw);

      return categoryOk && keywordOk;
    });
  }, [rows, categoryId, keyword, selectedCategoryName]);

  // ✅ PaginationSimple onChange: state + URL 동기화
  const onChangePage = (nextPage: number) => {
    const safe = Math.max(1, Math.min(nextPage, totalPages));
    setPage(safe);

    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(safe));
    router.replace(`${pathname}?${sp.toString()}`);
  };

  // ✅ Table columns 정의
  const columns: Array<TableColumn<NoticeListItemDto>> = useMemo(
    () => [
      {
        header: "번호",
        width: 90,
        align: "center",
        render: (_row, idx) => String(apiPage * size + idx + 1).padStart(5, "0"),
      },
      {
        header: "분류",
        width: 140,
        align: "center",
        render: (row) => {
          const cat = categoryByName.get(String(row.categoryName ?? ""));
          return (
            <span
              className={styles.badge}
              style={{
                backgroundColor: cat?.bgColor ?? "#F3F4F6",
                color: cat?.textColor ?? "#111827",
              }}
              title={cat ? `bg: ${cat.bgColor}, text: ${cat.textColor}` : ""}
            >
              {cat?.name ?? row.categoryName ?? "미분류"}
            </span>
          );
        },
      },
      {
        header: "제목",
        align: "left",
        render: (row) => (
          <span className={styles.titleCell} title={row.title}>
            {row.title}
          </span>
        ),
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
        field: "createdAt",
      },
    ],
    [apiPage, size, categoryByName]
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>&gt;</span>
        <strong>공지사항 관리</strong>
      </div>

      <div className={styles.header}>
        <div className={styles.title}>공지사항</div>

        <div className={styles.filters}>
          <select
            className={styles.select}
            value={categoryId === "ALL" ? "ALL" : String(categoryId)}
            onChange={(e) => setCategoryId(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
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
        <Table<NoticeListItemDto>
          columns={columns}
          items={filteredRows}
          rowKey={(row) => String(row.id)}
          onRowClick={(row) => router.push(`/admin/community/notices/${row.id}`)}
          loading={loading}
          skeletonRowCount={8}
          emptyText={error ? error : "검색 결과가 없습니다."}
          ariaLabel="공지사항 목록"
        />
      </div>

      <div className={styles.footer}>
        <Button variant="secondary" onClick={() => router.push("/admin/community/notices/categories")}>
          카테고리 관리
        </Button>

        <div className={styles.pagination}>
          <PaginationSimple page={page} totalPages={totalPages} onChange={onChangePage} disabled={loading} />
        </div>

        <Button variant="primary" onClick={() => router.push("/admin/community/notices/new")}>
          등록
        </Button>
      </div>
    </div>
  );
}
