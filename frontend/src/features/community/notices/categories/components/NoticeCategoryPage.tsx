"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/notice-category.module.css";
import type { NoticeCategoryId, NoticeCategoryRow } from "../types";
import { noticeCategoriesApi } from "../api/noticeCategoriesApi";

const PALETTE = ["#EEF2FF", "#FFF7ED", "#FEE2E2", "#ECFDF3", "#F5F3FF", "#F3F4F6"] as const;
const TEXT_PALETTE = ["#1E3A8A", "#9A3412", "#991B1B", "#166534", "#5B21B6", "#111827"] as const;

function isHex6(v: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(v);
}

function toId(id: NoticeCategoryId) {
  return String(id);
}

export default function NoticeCategoryPage() {
  const router = useRouter();

  const [rows, setRows] = useState<NoticeCategoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // create/edit box
  const [openBox, setOpenBox] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<NoticeCategoryId | null>(null);

  const [name, setName] = useState("");
  const [bgColor, setBgColor] = useState("#EEF2FF");
  const [textColor, setTextColor] = useState("#1E3A8A");

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && isHex6(bgColor) && isHex6(textColor);
  }, [name, bgColor, textColor]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return rows;
    return rows.filter((r) => (r.name ?? "").toLowerCase().includes(kw));
  }, [rows, keyword]);

  async function fetchList() {
    setLoading(true);
    setError(null);
    try {
      const data = await noticeCategoriesApi.list({
        page: 0,
        size: 50,
        keyword: keyword.trim() || undefined,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setRows([]);
      setError(e?.message ?? "카테고리 목록 조회 실패");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setName("");
    setBgColor("#EEF2FF");
    setTextColor("#1E3A8A");
    setEditingId(null);
    setMode("create");
  }

  function openCreate() {
    resetForm();
    setMode("create");
    setOpenBox(true);
  }

  function openEdit(row: NoticeCategoryRow) {
    setMode("edit");
    setEditingId(row.categoryId);
    setName(row.name ?? "");
    setBgColor(row.bgColor ?? "#EEF2FF");
    setTextColor(row.textColor ?? "#1E3A8A");
    setOpenBox(true);
  }

  function cancelBox() {
    setOpenBox(false);
    resetForm();
  }

  async function submit() {
    if (!canSubmit) return;

    try {
      if (mode === "create") {
        await noticeCategoriesApi.create({
          name: name.trim(),
          bgColorHex: bgColor,
          textColorHex: textColor,
        });
      } else {
        if (editingId == null) return;
        await noticeCategoriesApi.update(toId(editingId), {
          name: name.trim(),
          bgColorHex: bgColor,
          textColorHex: textColor,
        });
      }

      cancelBox();
      await fetchList();
    } catch (e: any) {
      alert(e?.message ?? (mode === "create" ? "카테고리 생성 실패" : "카테고리 수정 실패"));
    }
  }

  async function remove(row: NoticeCategoryRow) {
    const ok = window.confirm(`카테고리 "${row.name}"을(를) 삭제하시겠습니까?`);
    if (!ok) return;

    try {
      await noticeCategoriesApi.remove(toId(row.categoryId));
      await fetchList();
    } catch (e: any) {
      alert(e?.message ?? "삭제 실패");
    }
  }

  function goNoticeList() {
    router.push("/admin/community/notices");
  }

    return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>커뮤니티 - 공지사항 카테고리 관리</div>

      <div className={styles.headerRow}>
        <div className={styles.title}>공지사항</div>

        <div className={styles.search}>
          <input
            className={styles.searchInput}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="카테고리 검색"
          />
          <button className={styles.searchBtn} onClick={fetchList} disabled={loading}>
            검색
          </button>
        </div>
      </div>

      {/* ✅ (2) 페이지 영역 */}
      <div className={styles.card}>
        {/* ✅ (3) 목록 틀(파란 박스): table + "카테고리 추가하기"만 */}
        <div className={styles.listFrame}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colCategory}>분류</th>
                <th className={styles.colCount}>게시물 횟수</th>
                <th className={styles.colDate}>생성일</th>
                <th className={styles.colActions}></th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className={styles.empty}>
                    불러오는 중...
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.empty}>
                    {error ? error : "카테고리가 없습니다."}
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((row) => (
                  <tr key={toId(row.categoryId)}>
                    <td>
                      <div className={styles.categoryCell}>
                        <span
                          className={styles.badge}
                          style={{ backgroundColor: row.bgColor, color: row.textColor }}
                          title={`bg: ${row.bgColor}, text: ${row.textColor}`}
                        >
                          {row.name}
                        </span>

                        <div className={styles.editor}>
                          <div className={styles.muted}>
                            {row.lastCreatedAt ? `최근 생성: ${row.lastCreatedAt}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className={styles.center}>{Number(row.postCount ?? 0).toLocaleString()}</td>
                    <td className={styles.center}>{row.lastCreatedAt ?? "-"}</td>

                    <td>
                      <div className={styles.actions}>
                        <button className={styles.btnPrimary} onClick={() => openEdit(row)}>
                          수정
                        </button>
                        <button className={styles.btnDanger} onClick={() => remove(row)}>
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* ✅ "카테고리 추가하기"는 목록 틀 안에 유지 */}
          {!loading && (
            <div className={styles.addArea}>
              <button className={styles.addBtn} onClick={openCreate}>
                <div className={styles.plus}>+</div>
                <div>카테고리 추가하기</div>
              </button>
            </div>
          )}
        </div>

        {/* ✅ (그림처럼) 목록 틀 밖: 추가창 + 확인 버튼 */}
        {!loading && (
          <div className={styles.panelArea}>
            {/* ✅ 확인 버튼은 panelArea 우하단에 고정 */}
            <div className={styles.confirmFixed}>
              <button className={styles.confirmBtn} onClick={goNoticeList}>
                확인
              </button>
            </div>

            {/* ✅ 왼쪽: 추가/수정 창만 렌더링(열리면 이쪽만 커짐) */}
            <div className={styles.bottomRowInline}>
              {openBox && (
                <div className={styles.createBox}>
                  <div className={styles.createLeft}>
                    <div style={{ fontWeight: 800, marginBottom: 10 }}>
                      {mode === "create" ? "카테고리 추가" : "카테고리 수정"}
                    </div>

                    <div className={styles.colorRow}>
                      <div style={{ flex: 1, minWidth: 240 }}>
                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>이름</div>
                        <input
                          className={styles.nameInput}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="예: 학사"
                        />
                      </div>

                      <div className={styles.colorBlock}>
                        <div className={styles.colorLabel}>배경색</div>
                        <input
                          className={styles.colorPicker}
                          type="color"
                          value={isHex6(bgColor) ? bgColor : "#EEF2FF"}
                          onChange={(e) => setBgColor(e.target.value)}
                          title="배경색 선택"
                        />
                        <input
                          className={styles.nameInput}
                          style={{ width: 120, marginBottom: 0 }}
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          placeholder="#RRGGBB"
                        />
                        <div className={styles.palette}>
                          {PALETTE.map((c) => (
                            <button
                              key={c}
                              type="button"
                              className={styles.swatch}
                              style={{ backgroundColor: c }}
                              onClick={() => setBgColor(c)}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>

                      <div className={styles.colorBlock}>
                        <div className={styles.colorLabel}>글자색</div>
                        <input
                          className={styles.colorPicker}
                          type="color"
                          value={isHex6(textColor) ? textColor : "#1E3A8A"}
                          onChange={(e) => setTextColor(e.target.value)}
                          title="글자색 선택"
                        />
                        <input
                          className={styles.nameInput}
                          style={{ width: 120, marginBottom: 0 }}
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          placeholder="#RRGGBB"
                        />
                        <div className={styles.palette}>
                          {TEXT_PALETTE.map((c) => (
                            <button
                              key={c}
                              type="button"
                              className={styles.swatch}
                              style={{ backgroundColor: c }}
                              onClick={() => setTextColor(c)}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>미리보기</div>
                      <span
                        className={styles.badge}
                        style={{
                          backgroundColor: isHex6(bgColor) ? bgColor : "#EEF2FF",
                          color: isHex6(textColor) ? textColor : "#1E3A8A",
                        }}
                      >
                        {name.trim() ? name.trim() : "카테고리"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.createActions}>
                    <button className={styles.btnGhost} onClick={cancelBox}>
                      취소
                    </button>
                    <button className={styles.confirmBtn} onClick={submit} disabled={!canSubmit}>
                      {mode === "create" ? "추가" : "저장"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
