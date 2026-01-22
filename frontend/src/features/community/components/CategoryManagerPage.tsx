"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/features/community/styles/category-manager.module.css";
import type { CategoryRow, CategoryListParams } from "@/features/community/types/category";

const BG_PRESETS = ["#3b82f6", "#10b981", "#a855f7", "#f97316", "#ef4444", "#111827", "#64748b", "#fde047"];

type CategoryApi = {
  list: (params: CategoryListParams) => Promise<CategoryRow[]>;
  create: (body: { name: string; bgColor: string; textColor: string }) => Promise<any>;
  update: (id: string, body: { name: string; bgColor: string; textColor: string }) => Promise<any>;
  remove: (id: string) => Promise<any>;
};

function Badge({ name, bgColor, textColor }: { name: string; bgColor: string; textColor: string }) {
  return (
    <span className={styles.badge} style={{ backgroundColor: bgColor, color: textColor }}>
      {name || "미리보기"}
    </span>
  );
}

export default function CategoryManagerPage(props: {
  breadcrumb: string;     // 예: "커뮤니티 - 자료실 카테고리 관리"
  title: string;          // 예: "자료실"
  backTo: string;         // 예: "/admin/community/resources"
  api: CategoryApi;
}) {
  const router = useRouter();
  const { breadcrumb, title, backTo, api } = props;

  const [keyword, setKeyword] = useState("");
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBg, setNewBg] = useState("#3b82f6");
  const [newText, setNewText] = useState("#ffffff");

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editBg, setEditBg] = useState("#3b82f6");
  const [editText, setEditText] = useState("#ffffff");

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.list({ page: 0, size: 50, keyword });
      setRows(data);
    } catch (e: any) {
      setError(e?.message ?? "카테고리 조회 실패");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return rows;
    return rows.filter((r) => (r.name ?? "").toLowerCase().includes(kw));
  }, [rows, keyword]);

  const startEdit = (row: CategoryRow) => {
    setEditId(String(row.categoryId));
    setEditName(row.name ?? "");
    setEditBg(row.bgColor ?? "#3b82f6");
    setEditText(row.textColor ?? "#ffffff");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
    setEditBg("#3b82f6");
    setEditText("#ffffff");
  };

  const saveEdit = async () => {
    if (!editId) return;
    if (!editName.trim()) return alert("카테고리 제목을 입력하세요.");
    try {
      await api.update(editId, { name: editName.trim(), bgColor: editBg, textColor: editText });
      cancelEdit();
      await fetchList();
    } catch (e: any) {
      alert(e?.message ?? "수정 실패");
    }
  };

  const remove = async (row: CategoryRow) => {
    const ok = window.confirm(`"${row.name}" 카테고리를 삭제하시겠습니까?`);
    if (!ok) return;
    try {
      await api.remove(String(row.categoryId));
      await fetchList();
    } catch (e: any) {
      alert(e?.message ?? "삭제 실패");
    }
  };

  const create = async () => {
    if (!newName.trim()) return alert("카테고리 제목을 입력하세요.");
    try {
      await api.create({ name: newName.trim(), bgColor: newBg, textColor: newText });
      setCreateOpen(false);
      setNewName("");
      setNewBg("#3b82f6");
      setNewText("#ffffff");
      await fetchList();
    } catch (e: any) {
      alert(e?.message ?? "등록 실패");
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>{breadcrumb}</div>

      <div className={styles.headerRow}>
        <div className={styles.title}>{title}</div>

        <div className={styles.search}>
          <input
            className={styles.searchInput}
            placeholder="검색어 입력..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button className={styles.searchBtn} onClick={fetchList} disabled={loading}>
            검색
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colCategory}>분류</th>
              <th className={styles.colCount}>게시물 횟수</th>
              <th className={styles.colDate}>최근 생성일</th>
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

            {!loading &&
              filtered.map((row) => {
                const isEdit = editId === String(row.categoryId);
                return (
                  <tr key={String(row.categoryId)}>
                    <td>
                      <div className={styles.categoryCell}>
                        <Badge
                          name={isEdit ? editName : row.name}
                          bgColor={isEdit ? editBg : row.bgColor}
                          textColor={isEdit ? editText : row.textColor}
                        />

                        {isEdit && (
                          <div className={styles.editor}>
                            <input
                              className={styles.nameInput}
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="카테고리 제목..."
                            />

                            <div className={styles.colorRow}>
                              <div className={styles.colorBlock}>
                                <div className={styles.colorLabel}>배경</div>
                                <input type="color" className={styles.colorPicker} value={editBg} onChange={(e) => setEditBg(e.target.value)} />
                              </div>
                              <div className={styles.colorBlock}>
                                <div className={styles.colorLabel}>글자</div>
                                <input type="color" className={styles.colorPicker} value={editText} onChange={(e) => setEditText(e.target.value)} />
                              </div>

                              <div className={styles.palette}>
                                {BG_PRESETS.map((c) => (
                                  <button key={c} type="button" className={styles.swatch} style={{ backgroundColor: c }} onClick={() => setEditBg(c)} />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className={styles.center}>{row.postCount ?? "-"}</td>
                    <td className={styles.center}>{row.lastCreatedAt ?? "-"}</td>

                    <td className={styles.actions}>
                      {isEdit ? (
                        <>
                          <button className={styles.btnPrimary} onClick={saveEdit}>
                            완료
                          </button>
                          <button className={styles.btnDanger} onClick={cancelEdit}>
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button className={styles.btnPrimary} onClick={() => startEdit(row)}>
                            수정
                          </button>
                          <button className={styles.btnDanger} onClick={() => remove(row)}>
                            삭제
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className={styles.empty}>
                  {error ? error : "카테고리가 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className={styles.addArea}>
          {!createOpen ? (
            <button className={styles.addBtn} onClick={() => setCreateOpen(true)}>
              <span className={styles.plus}>+</span>
              <span>카테고리 추가하기</span>
            </button>
          ) : (
            <div className={styles.createBox}>
              <div className={styles.createLeft}>
                <Badge name={newName} bgColor={newBg} textColor={newText} />

                <input className={styles.nameInput} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="카테고리 제목..." />

                <div className={styles.colorRow}>
                  <div className={styles.colorBlock}>
                    <div className={styles.colorLabel}>배경</div>
                    <input type="color" className={styles.colorPicker} value={newBg} onChange={(e) => setNewBg(e.target.value)} />
                  </div>
                  <div className={styles.colorBlock}>
                    <div className={styles.colorLabel}>글자</div>
                    <input type="color" className={styles.colorPicker} value={newText} onChange={(e) => setNewText(e.target.value)} />
                  </div>

                  <div className={styles.palette}>
                    {BG_PRESETS.map((c) => (
                      <button key={c} type="button" className={styles.swatch} style={{ backgroundColor: c }} onClick={() => setNewBg(c)} />
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.createActions}>
                <button className={styles.btnPrimary} onClick={create}>
                  완료
                </button>
                <button
                  className={styles.btnDanger}
                  onClick={() => {
                    setCreateOpen(false);
                    setNewName("");
                    setNewBg("#3b82f6");
                    setNewText("#ffffff");
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.bottomRow}>
        <button className={styles.confirmBtn} onClick={() => router.push(backTo)}>
          확인
        </button>
      </div>
    </div>
  );
}
