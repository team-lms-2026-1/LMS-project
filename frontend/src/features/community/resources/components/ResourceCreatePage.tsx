"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/resource-list.module.css"; 
import { resourceCategoriesApi } from "../categories/api/resourceCategoriesApi";
import type { ResourceCategoryDto } from "../categories/api/dto";

const BG_PRESETS = ["#E6F4FF", "#DCFCE7", "#F3F4F6", "#DDD6FE", "#FCE7F3", "#FDE68A", "#FED7AA", "#E5E7EB", "#111827"];
const TX_PRESETS = ["#1D4ED8", "#047857", "#111827", "#6D28D9", "#BE185D", "#92400E", "#9A3412", "#111827", "#FFFFFF"];

function Chip({ name, bg, color }: { name: string; bg: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 14px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: bg,
        color,
        minWidth: 70,
        textAlign: "center",
      }}
    >
      {name}
    </span>
  );
}

export default function ResourceCategoryPage() {
  const router = useRouter();

  const [keyword, setKeyword] = useState("");
  const [rows, setRows] = useState<ResourceCategoryDto[]>([]);
  const [loading, setLoading] = useState(false);

  // 폼(생성/수정 공용) — ✅ ID 없음
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [bgColorHex, setBgColorHex] = useState("#E6F4FF");
  const [textColorHex, setTextColorHex] = useState("#1D4ED8");

  const isEditing = editingId != null;

  const filteredRows = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return rows;
    return rows.filter((r) => (r.name ?? "").toLowerCase().includes(kw));
  }, [rows, keyword]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await resourceCategoriesApi.list({ page: 0, size: 200 });
      setRows(data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setBgColorHex("#E6F4FF");
    setTextColorHex("#1D4ED8");
  };

  const onStartEdit = (row: ResourceCategoryDto) => {
    setEditingId(row.categoryId);
    setName(row.name ?? "");
    setBgColorHex(row.bgColorHex ?? "#E6F4FF");
    setTextColorHex(row.textColorHex ?? "#1D4ED8");
  };

  const onSave = async () => {
    if (!name.trim()) return alert("카테고리 이름을 입력하세요.");

    try {
      if (isEditing) {
        await resourceCategoriesApi.update(editingId!, {
          name: name.trim(),
          bgColorHex,
          textColorHex,
        });
      } else {
        await resourceCategoriesApi.create({
          name: name.trim(),
          bgColorHex,
          textColorHex,
        });
      }

      await fetchList();
      resetForm();
    } catch (e: any) {
      alert(e?.message ?? "저장 실패");
    }
  };

  const onDelete = async (row: ResourceCategoryDto) => {
    const ok = window.confirm(`"${row.name}" 카테고리를 삭제하시겠습니까?`);
    if (!ok) return;

    try {
      await resourceCategoriesApi.remove(row.categoryId);
      await fetchList();
      if (editingId === row.categoryId) resetForm();
    } catch (e: any) {
      alert(e?.message ?? "삭제 실패");
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <span>커뮤니티</span>
        <span>-</span>
        <span>자료실 카테고리 관리</span>
      </div>

      <div className={styles.header}>
        <div className={styles.title}>자료실</div>

        <div className={styles.filters}>
          <input
            className={styles.input}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="검색어 입력..."
          />
          <button className={styles.searchBtn} onClick={fetchList} disabled={loading}>
            검색
          </button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 240, textAlign: "left" }}>분류</th>
              <th style={{ width: 160, textAlign: "center" }}>게시물 횟수</th>
              <th style={{ width: 180, textAlign: "center" }}>최근 생성일</th>
              <th style={{ width: 170 }} />
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} style={{ padding: 18, textAlign: "center", color: "#777" }}>
                  불러오는 중...
                </td>
              </tr>
            )}

            {!loading &&
              filteredRows.map((r) => (
                <tr key={String(r.categoryId)}>
                  <td>
                    <Chip name={r.name} bg={r.bgColorHex} color={r.textColorHex} />
                  </td>
                  <td style={{ textAlign: "center", color: "#6b7280" }}>{r.postCount ?? "-"}</td>
                  <td style={{ textAlign: "center", color: "#6b7280" }}>{r.latestCreatedAt ?? "-"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className={styles.pageBtn}
                      style={{ marginRight: 8, background: "#2563eb", color: "#fff" }}
                      onClick={() => onStartEdit(r)}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      className={styles.pageBtn}
                      style={{ background: "#ef4444", color: "#fff" }}
                      onClick={() => onDelete(r)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}

            {/* 하단 추가/수정 폼 */}
            {!loading && (
              <tr>
                <td colSpan={4} style={{ padding: 18 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 18,
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      padding: 18,
                      background: "#fff",
                    }}
                  >
                    <Chip name={name.trim() || "test"} bg={bgColorHex} color={textColorHex} />

                    {/* ✅ ID 입력 제거: 이름만 받음 */}
                    <input
                      className={styles.input}
                      style={{ width: 260 }}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="카테고리 이름..."
                    />

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>배경</div>
                      <input
                        type="color"
                        value={bgColorHex}
                        onChange={(e) => setBgColorHex(e.target.value)}
                        style={{ width: 36, height: 28, padding: 0, border: "1px solid #d1d5db", borderRadius: 6 }}
                        title="배경색"
                      />
                      {BG_PRESETS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setBgColorHex(c)}
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            border: "1px solid #d1d5db",
                            background: c,
                            cursor: "pointer",
                          }}
                          title={c}
                        />
                      ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>글자</div>
                      <input
                        type="color"
                        value={textColorHex}
                        onChange={(e) => setTextColorHex(e.target.value)}
                        style={{ width: 36, height: 28, padding: 0, border: "1px solid #d1d5db", borderRadius: 6 }}
                        title="글자색"
                      />
                      {TX_PRESETS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setTextColorHex(c)}
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            border: "1px solid #d1d5db",
                            background: c,
                            cursor: "pointer",
                          }}
                          title={c}
                        />
                      ))}
                    </div>

                    <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
                      <button
                        type="button"
                        className={styles.pageBtn}
                        style={{ background: "#2563eb", color: "#fff" }}
                        onClick={onSave}
                      >
                        완료
                      </button>
                      <button
                        type="button"
                        className={styles.pageBtn}
                        style={{ background: "#ef4444", color: "#fff" }}
                        onClick={resetForm}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {!loading && filteredRows.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 18, textAlign: "center", color: "#777" }}>
                  카테고리가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ 하단 확인 버튼: 자료실 목록으로 복귀 */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <button
          type="button"
          className={styles.rightBtn}
          onClick={() => router.push("/admin/community/resources")}
        >
          확인
        </button>
      </div>
    </div>
  );
}
