"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "@/features/community/notices/categories/styles/notice-category.module.css";
import { makeCategoryManagerApi } from "@/features/community/components/categoryManager/categoryManagerApi";

// ✅ UI에서 사용하는 Row 타입만 유지
type CategoryId = number;

export type CategoryRow = {
  categoryId: CategoryId;
  name: string;
  bgColor: string;   // #RRGGBB
  textColor: string; // #RRGGBB
  postCount?: number;
  lastCreatedAt?: string;
};

type Props = {
  breadcrumb: string;
  pageTitle: string;
  confirmHref: string;
  basePath: string;
};

const PALETTE = ["#EEF2FF", "#FFF7ED", "#FEE2E2", "#ECFDF3", "#F5F3FF", "#F3F4F6"] as const;
const TEXT_PALETTE = ["#1F2937", "#1E3A8A", "#9A3412", "#991B1B", "#166534", "#5B21B6"] as const;

function isHex6(v: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(v);
}

export default function CategoryManagerPage(props: Props) {
  const { breadcrumb, pageTitle, confirmHref, basePath } = props;

  const router = useRouter();

  // ✅ basePath 바뀌면 api도 같이 바뀜
  const api = useMemo(() => makeCategoryManagerApi(basePath), [basePath]);

  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // create/edit box
  const [openBox, setOpenBox] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<CategoryId | null>(null);

  const [name, setName] = useState("");
  const [bgColor, setBgColor] = useState("#EEF2FF");
  const [textColor, setTextColor] = useState("#1F2937");

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && isHex6(bgColor) && isHex6(textColor);
  }, [name, bgColor, textColor]);

  // ✅ 화면 필터는 클라에서만 (서버에는 keyword 안 보냄)
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return rows;
    return rows.filter((r) => (r.name ?? "").toLowerCase().includes(kw));
  }, [rows, keyword]);

  async function fetchList() {
    setLoading(true);
    setError(null);
    try {
      const list = await api.list({ page: 0, size: 200 });
      setRows(list);
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
  }, [basePath]); // ✅ basePath가 바뀌면 다시 로드

  function resetForm() {
    setName("");
    setBgColor("#EEF2FF");
    setTextColor("#1F2937");
    setEditingId(null);
    setMode("create");
  }

  function openCreate() {
    resetForm();
    setMode("create");
    setOpenBox(true);
  }

  function openEdit(row: CategoryRow) {
    setMode("edit");
    setEditingId(row.categoryId);
    setName(row.name ?? "");
    setBgColor(row.bgColor ?? "#EEF2FF");
    setTextColor(row.textColor ?? "#1F2937");
    setOpenBox(true);
  }

  function cancelBox() {
    setOpenBox(false);
    resetForm();
  }

  async function submit() {
    if (!canSubmit) return;

    const body = { name: name.trim(), bgColorHex: bgColor, textColorHex: textColor };

    try {
      if (mode === "create") {
        await api.create(body);
      } else {
        if (editingId == null) return;
        await api.update(String(editingId), body);
      }

      cancelBox();
      setKeyword("");
      await fetchList();
    } catch (e: any) {
      alert(e?.message ?? (mode === "create" ? "카테고리 생성 실패" : "카테고리 수정 실패"));
    }
  }

  async function remove(row: CategoryRow) {
    const ok = window.confirm(`카테고리 "${row.name}"을(를) 삭제하시겠습니까?`);
    if (!ok) return;

    try {
      await api.remove(String(row.categoryId));
      setKeyword("");
      await fetchList();
    } catch (e: any) {
      alert(e?.message ?? "삭제 실패");
    }
  }

  function goBack() {
    router.push(confirmHref);
  }

  function toId(id: number) {
   return String(id);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>{breadcrumb}</div>

      <div className={styles.headerRow}>
        <div className={styles.title}>{pageTitle}</div>

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

      <div className={styles.card}>
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

          {!loading && (
            <div className={styles.addArea}>
              <button className={styles.addBtn} onClick={openCreate}>
                <div className={styles.plus}>+</div>
                <div>카테고리 추가하기</div>
              </button>
            </div>
          )}
        </div>

        {!loading && (
          <div className={styles.panelArea}>
            <div className={styles.confirmFixed}>
              <button className={styles.confirmBtn} onClick={goBack}>
                확인
              </button>
            </div>

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
