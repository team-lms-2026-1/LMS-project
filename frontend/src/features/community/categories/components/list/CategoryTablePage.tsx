"use client";

import { useMemo, useState } from "react";
import { Table, type TableColumn } from "@/components/table";
import { Button } from "@/components/button";

import styles from "./CategoryTable.module.css";
import type { Category, CategoryScope, CreateCategoryRequestDto, UpdateCategoryRequestDto } from "../../api/types";
import { categoriesApi } from "../../api/CategoriesApi";

type Props = {
  scope: CategoryScope;
  items: Category[];
  loading: boolean;
  onReload: () => void;
};

function normalizeHex(v: string) {
  const s = (v ?? "").trim();
  if (!s) return "";
  return s.startsWith("#") ? s : `#${s}`;
}

export function CategoryTablePage({ scope, items, loading, onReload }: Props) {
  // add/edit 상태
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // form state (add/edit 공용)
  const [name, setName] = useState("");
  const [bgColorHex, setBgColorHex] = useState("#E5E7EB");
  const [textColorHex, setTextColorHex] = useState("#111827");

  const isEditing = (id: number) => editingId === id;

  const resetForm = () => {
    setName("");
    setBgColorHex("#E5E7EB");
    setTextColorHex("#111827");
  };

  const openAdd = () => {
    setEditingId(null);
    setIsAdding(true);
    resetForm();
  };

  const openEdit = (c: Category) => {
    setIsAdding(false);
    setEditingId(c.categoryId);
    setName(c.name ?? "");
    setBgColorHex(c.bgColorHex as any);
    setTextColorHex(c.textColorHex as any);
  };

  const cancelInline = () => {
    setIsAdding(false);
    setEditingId(null);
    resetForm();
  };

  const submitAdd = async () => {
    const n = name.trim();
    const bg = normalizeHex(bgColorHex);
    const tx = normalizeHex(textColorHex);

    if (!n) return alert("카테고리 이름을 입력하세요.");
    if (!bg || !tx) return alert("색상을 지정하세요.");

    const body: CreateCategoryRequestDto = { name: n, bgColorHex: bg, textColorHex: tx };

    try {
      await categoriesApi.create(scope, body);
      await onReload();
      cancelInline();
    } catch (e: any) {
      alert(e?.message ?? "카테고리 추가 실패");
    }
  };

  const submitEdit = async (id: number) => {
    const n = name.trim();
    const bg = normalizeHex(bgColorHex);
    const tx = normalizeHex(textColorHex);

    if (!n) return alert("카테고리 이름을 입력하세요.");
    if (!bg || !tx) return alert("색상을 지정하세요.");

    const body: UpdateCategoryRequestDto = { name: n, bgColorHex: bg, textColorHex: tx };

    try {
      await categoriesApi.update(scope, id, body);
      await onReload();
      cancelInline();
    } catch (e: any) {
      alert(e?.message ?? "카테고리 수정 실패");
    }
  };

  const onDelete = async (c: Category) => {
    const ok = confirm(`"${c.name}" 카테고리를 삭제할까요?`);
    if (!ok) return;

    try {
      await categoriesApi.remove(scope, c.categoryId);
      await onReload();
    } catch (e: any) {
      alert(e?.message ?? "카테고리 삭제 실패");
    }
  };

  const columns: Array<TableColumn<Category>> = useMemo(
    () => [
      { header: "번호", align: "left", width: 120, render: (r) => r.categoryId },

      {
        header: "분류",
        align: "left",
        render: (r) => {
          // ✅ 인라인 수정 모드면: 입력폼
          if (isEditing(r.categoryId)) {
            return (
              <div className={styles.inlineForm}>
                <input
                  className={styles.nameInput}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="카테고리 제목..."
                  maxLength={40}
                  disabled={loading}
                />

                <div className={styles.colorRow}>
                  <div className={styles.colorPickerGroup}>
                    <span className={styles.colorLabel}>배경</span>
                    <input
                      type="color"
                      className={styles.colorInput}
                      value={bgColorHex}
                      onChange={(e) => setBgColorHex(e.target.value)}
                      disabled={loading}
                    />
                    <input
                      className={styles.hexInput}
                      value={bgColorHex}
                      onChange={(e) => setBgColorHex(normalizeHex(e.target.value))}
                      disabled={loading}
                    />
                  </div>

                  <div className={styles.colorPickerGroup}>
                    <span className={styles.colorLabel}>글자</span>
                    <input
                      type="color"
                      className={styles.colorInput}
                      value={textColorHex}
                      onChange={(e) => setTextColorHex(e.target.value)}
                      disabled={loading}
                    />
                    <input
                      className={styles.hexInput}
                      value={textColorHex}
                      onChange={(e) => setTextColorHex(normalizeHex(e.target.value))}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className={styles.previewRow}>
                  <span
                    className={styles.badge}
                    style={{ backgroundColor: bgColorHex, color: textColorHex }}
                  >
                    {name || "미리보기"}
                  </span>
                </div>
              </div>
            );
          }

          // ✅ 일반 모드면: 뱃지 표시
          return (
            <span className={styles.badge} style={{ backgroundColor: r.bgColorHex, color: r.textColorHex }}>
              {r.name}
            </span>
          );
        },
      },

      {
        header: "관리",
        align: "center",
        width: 220,
        stopRowClick: true,
        render: (r) => {
          const editing = isEditing(r.categoryId);

          if (editing) {
            return (
              <div className={styles.manageCell}>
                <Button variant="primary" onClick={() => submitEdit(r.categoryId)} disabled={loading}>
                  저장
                </Button>
                <Button variant="danger" onClick={cancelInline} disabled={loading}>
                  취소
                </Button>
              </div>
            );
          }

          return (
            <div className={styles.manageCell}>
              <Button variant="secondary" onClick={() => openEdit(r)} disabled={loading || isAdding}>
                수정
              </Button>
              <Button variant="danger" onClick={() => onDelete(r)} disabled={loading || isAdding}>
                삭제
              </Button>
            </div>
          );
        },
      },
    ],
    [bgColorHex, editingId, isAdding, loading, name, textColorHex]
  );

  return (
    <div className={styles.wrap}>
      {/* ✅ 실제 리스트 테이블 */}
      <Table<Category>
        columns={columns}
        items={items}
        loading={loading}
        skeletonRowCount={8}
        rowKey={(r) => r.categoryId}
        emptyText="카테고리가 없습니다."
      />

      {/* ✅ 테이블 내부(하단) 추가 영역 */}
      <div className={styles.addArea}>
        {isAdding ? (
          <div className={styles.addRow}>
            <div className={styles.addFormLeft}>
              <input
                className={styles.nameInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="카테고리 제목..."
                maxLength={40}
                disabled={loading}
              />

              <div className={styles.colorRow}>
                <div className={styles.colorPickerGroup}>
                  <span className={styles.colorLabel}>배경</span>
                  <input
                    type="color"
                    className={styles.colorInput}
                    value={bgColorHex}
                    onChange={(e) => setBgColorHex(e.target.value)}
                    disabled={loading}
                  />
                  <input
                    className={styles.hexInput}
                    value={bgColorHex}
                    onChange={(e) => setBgColorHex(normalizeHex(e.target.value))}
                    disabled={loading}
                  />
                </div>

                <div className={styles.colorPickerGroup}>
                  <span className={styles.colorLabel}>글자</span>
                  <input
                    type="color"
                    className={styles.colorInput}
                    value={textColorHex}
                    onChange={(e) => setTextColorHex(e.target.value)}
                    disabled={loading}
                  />
                  <input
                    className={styles.hexInput}
                    value={textColorHex}
                    onChange={(e) => setTextColorHex(normalizeHex(e.target.value))}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className={styles.previewRow}>
                <span className={styles.badge} style={{ backgroundColor: bgColorHex, color: textColorHex }}>
                  {name || "미리보기"}
                </span>
              </div>
            </div>

            <div className={styles.addFormRight}>
              <Button variant="primary" onClick={submitAdd} disabled={loading}>
                완료
              </Button>
              <Button variant="danger" onClick={cancelInline} disabled={loading}>
                취소
              </Button>
            </div>
          </div>
        ) : (
          <button type="button" className={styles.addButton} onClick={openAdd} disabled={loading || editingId !== null}>
            <span className={styles.plus}>＋</span>
            <span className={styles.addText}>카테고리 추가하기</span>
          </button>
        )}
      </div>
    </div>
  );
}
