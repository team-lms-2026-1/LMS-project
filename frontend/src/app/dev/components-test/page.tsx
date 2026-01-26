"use client";

import * as React from "react";

import { Button, RegisterNavButton, EditNavButton, DeleteActionButton } from "@/components/button";
import { StatusPill, type StatusType } from "@/components/status";
import { ToggleSwitch } from "@/components/toggle";
import { SearchBar } from "@/components/search";
import { Pagenation } from "@/components/pagenation";

type Row = {
  id: number;
  title: string;
  author: string;
  status: StatusType;
  enabled: boolean;
};

const ALL_STATUSES: StatusType[] = [
  "DRAFT",
  "OPEN",
  "ENROLL_CLOSED",
  "PROGRESS",
  "COMPLETED",
  "CLOSED",
  "CANCELED",
];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function matches(row: Row, keyword: string, filter: string) {
  const k = keyword.trim().toLowerCase();
  if (!k) return true;

  const title = row.title.toLowerCase();
  const author = row.author.toLowerCase();
  const status = row.status.toLowerCase();

  switch (filter) {
    case "TITLE":
      return title.includes(k);
    case "AUTHOR":
      return author.includes(k);
    case "STATUS":
      return status.includes(k);
    default:
      // ALL
      return title.includes(k) || author.includes(k) || status.includes(k);
  }
}

export default function ComponentsTestPage() {
  // -------- Search / Filter (로컬 상태로 테스트) --------
  const [filter, setFilter] = React.useState<string>("");
  const [keyword, setKeyword] = React.useState<string>("");

  // -------- Pagenation --------
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(6);

  // -------- Mock data --------
  const [rows, setRows] = React.useState<Row[]>(() => {
    const base: Row[] = [];
    for (let i = 1; i <= 27; i++) {
      base.push({
        id: i,
        title: `테스트 게시물 ${i}`,
        author: i % 3 === 0 ? "admin" : i % 3 === 1 ? "professor" : "student",
        status: ALL_STATUSES[(i - 1) % ALL_STATUSES.length],
        enabled: i % 2 === 0,
      });
    }
    return base;
  });

  // 검색/필터 적용 결과
  const filtered = React.useMemo(() => {
    return rows.filter((r) => matches(r, keyword, filter));
  }, [rows, keyword, filter]);

  // 페이지 계산
  const totalPages = React.useMemo(() => {
    const t = Math.ceil(filtered.length / size);
    return Math.max(1, t);
  }, [filtered.length, size]);

  const currentPage = Math.min(page, totalPages);

  const pageRows = React.useMemo(() => {
    const start = (currentPage - 1) * size;
    return filtered.slice(start, start + size);
  }, [filtered, currentPage, size]);

  // 검색 실행 시 page=1 리셋
  const handleSearch = (k: string, f: string) => {
    setKeyword(k);
    setFilter(f);
    setPage(1);
  };

  // 상태 토글(예시)
  const toggleEnabled = async (id: number, next: boolean) => {
    // 실제론 API 호출
    await sleep(250);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: next } : r)));
  };

  // 삭제(예시)
  const deleteRow = async (id: number) => {
    // 실제론 API 호출
    await sleep(400);
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // 상태 변경(예시)
  const cycleStatus = async (id: number) => {
    await sleep(150);
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const idx = ALL_STATUSES.indexOf(r.status);
        const next = ALL_STATUSES[(idx + 1) % ALL_STATUSES.length];
        return { ...r, status: next };
      })
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#111827", margin: 0 }}>
          공용 컴포넌트 테스트
        </h1>
        <p style={{ margin: "8px 0 0", color: "#6b7280", fontSize: 13 }}>
          버튼 / 상태 / 토글 / 검색 / 페이지네이션을 한 화면에서 검증합니다.
        </p>
      </div>

      {/* 1) 버튼 컴포넌트 테스트 */}
      <section style={cardStyle}>
        <h2 style={h2Style}>Button</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" loading>
            Loading
          </Button>

          {/* Navigate 래퍼 테스트: 실제 프로젝트 경로로 바꿔서 사용 */}
          <RegisterNavButton href="/admin/community/notices/create" label="등록(이동)" />
          <EditNavButton href="/admin/community/notices/1/edit" label="수정(이동)" />
        </div>
      </section>

      {/* 2) 상태 배지 테스트 */}
      <section style={cardStyle}>
        <h2 style={h2Style}>StatusPill</h2>
        <div style={{ display: "grid", gap: 10, maxWidth: 220 }}>
          {ALL_STATUSES.map((s) => (
            <StatusPill key={s} status={s} />
          ))}
        </div>
        <div style={{ marginTop: 12, color: "#6b7280", fontSize: 12 }}>
          표기만 하는 경우: onClick 없이 사용 / 동작형은 아래 테이블에서 테스트합니다.
        </div>
      </section>

      {/* 3) 토글 테스트 */}
      <section style={cardStyle}>
        <h2 style={h2Style}>ToggleSwitch</h2>

        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          <ToggleSwitch checked={true} onChange={() => {}} />
          <ToggleSwitch checked={false} onChange={() => {}} />
          <ToggleSwitch checked={true} onChange={() => {}} disabled />
          <ToggleSwitch checked={false} onChange={() => {}} disabled />
        </div>
      </section>

      {/* 4) 검색 + 테이블 + 페이지네이션 통합 테스트 */}
      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={h2Style}>Search + List + Pagenation</h2>
            <div style={{ color: "#6b7280", fontSize: 12 }}>
              검색/필터 적용 후 페이지네이션과 row 액션(상태 변경/토글/삭제)을 같이 확인합니다.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <label style={{ fontSize: 12, color: "#6b7280" }}>페이지 크기</label>
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(1);
              }}
              style={{
                height: 34,
                border: "1px solid #dcdcdc",
                borderRadius: 6,
                padding: "0 10px",
                fontSize: 13,
                background: "#fff",
                outline: "none",
              }}
            >
              {[5, 6, 10, 15].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <SearchBar
            keyword={keyword}
            filter={filter}
            filterOptions={[
              { value: "", label: "전체" },
              { value: "TITLE", label: "제목" },
              { value: "AUTHOR", label: "작성자" },
              { value: "STATUS", label: "상태" },
            ]}
            onSearch={handleSearch}
            placeholder="검색어 입력"
          />
        </div>

        <div style={{ marginTop: 12, overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>제목</th>
                <th style={thStyle}>작성자</th>
                <th style={thStyle}>상태</th>
                <th style={thStyle}>활성</th>
                <th style={thStyle}>액션</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                pageRows.map((r) => (
                  <tr key={r.id}>
                    <td style={tdStyle}>{r.id}</td>
                    <td style={tdStyle}>{r.title}</td>
                    <td style={tdStyle}>{r.author}</td>
                    <td style={tdStyle}>
                      <StatusPill
                        status={r.status}
                        onClick={() => cycleStatus(r.id)}
                        title="클릭 시 상태가 다음 단계로 변경됩니다(테스트)"
                      />
                    </td>
                    <td style={tdStyle}>
                      <ToggleSwitch
                        checked={r.enabled}
                        onChange={(next) => toggleEnabled(r.id, next)}
                      />
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <EditNavButton href={`/admin/community/notices/${r.id}/edit`} label="수정" />
                        <DeleteActionButton
                          label="삭제"
                          confirmMessage="정말 삭제하시겠습니까?"
                          refreshOnSuccess={false} // 테스트 페이지에서는 router.refresh 대신 local state로 제거
                          onDelete={() => deleteRow(r.id)}
                          onDeleted={() => {
                            // 삭제 후 현재 페이지가 비어버리면 페이지 보정
                            // (예: 마지막 페이지에서 마지막 row 삭제)
                            const nextTotal = Math.max(1, Math.ceil((filtered.length - 1) / size));
                            setPage((p) => Math.min(p, nextTotal));
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            총 {filtered.length}건 / 페이지 {currentPage} / {totalPages}
          </div>

          <Pagenation page={currentPage} totalPages={totalPages} onChange={setPage} />
        </div>
      </section>
    </div>
  );
}

// ----- inline styles (테스트용) -----
const cardStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  background: "#ffffff",
  padding: 16,
  marginBottom: 14,
};

const h2Style: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 900,
  color: "#111827",
  margin: 0,
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 820,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "1px solid #e5e7eb",
  color: "#374151",
  fontSize: 12,
};

const tdStyle: React.CSSProperties = {
  padding: "12px",
  borderBottom: "1px solid #f1f5f9",
  fontSize: 13,
  verticalAlign: "middle",
};
