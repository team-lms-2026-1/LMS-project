"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
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

function sanitizeHexInput(raw: string) {
  let s = String(raw ?? "").trim();
  if (s.startsWith("#")) s = s.slice(1);
  s = s.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
  return `#${s.toUpperCase()}`;
}

function isHex6(v: string) {
  return /^#[0-9A-F]{6}$/.test((v ?? "").toUpperCase());
}

function safeHex(v: string, fallback: string) {
  return isHex6(v) ? v.toUpperCase() : fallback;
}

const LEAVE_MSG = "편집 중인 항목이 있습니다. 저장 또는 취소 후 확인하세요.";

// ✅ 부모에서 확인 버튼 눌렀을 때 호출할 수 있게 핸들 타입 export
export type CategoryTablePageHandle = {
  isDirty: () => boolean;
  showLeaveToast: () => void;
};

export const CategoryTablePage = forwardRef<CategoryTablePageHandle, Props>(function CategoryTablePageInner(
  { scope, items, loading, onReload }: Props,
  ref
) {
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
    setBgColorHex(safeHex(String(c.bgColorHex ?? ""), "#E5E7EB"));
    setTextColorHex(safeHex(String(c.textColorHex ?? ""), "#111827"));
  };

  const cancelInline = () => {
    setIsAdding(false);
    setEditingId(null);
    resetForm();
  };

  // ✅ "편집 중" 여부
  const isDirty = isAdding || editingId !== null;

  // ✅ 로컬 토스트
  const [toastMsg, setToastMsg] = useState<string>("");
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(""), 2200);
  }, []);

  const showLeaveToast = useCallback(() => {
    showToast(LEAVE_MSG);
  }, [showToast]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  // ✅ 부모에서 isDirty / 토스트를 호출 가능하게 노출
  useImperativeHandle(
    ref,
    () => ({
      isDirty: () => isDirty,
      showLeaveToast,
    }),
    [isDirty, showLeaveToast]
  );

  // ✅ 새로고침/탭 닫기: 브라우저 기본 경고(토스트 불가)
  useEffect(() => {
    if (!isDirty) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  // ✅ 뒤로가기(popstate) 막고 토스트
  const pushedRef = useRef(false);
  useEffect(() => {
    if (!isDirty) {
      pushedRef.current = false;
      return;
    }

    if (!pushedRef.current) {
      history.pushState(null, "", location.href);
      pushedRef.current = true;
    }

    const onPopState = () => {
      history.pushState(null, "", location.href);
      showLeaveToast();
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isDirty, showLeaveToast]);

  // ✅ 링크(<a>) 클릭 가드
  useEffect(() => {
    const onClickCapture = (e: MouseEvent) => {
      if (!isDirty) return;

      const target = e.target as HTMLElement | null;
      const a = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;

      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== "_self") return;

      const hrefAttr = a.getAttribute("href") ?? "";
      if (hrefAttr.startsWith("mailto:") || hrefAttr.startsWith("tel:")) return;
      if (a.hasAttribute("download")) return;

      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      e.preventDefault();
      e.stopPropagation();
      showLeaveToast();
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [isDirty, showLeaveToast]);

  const submitAdd = async () => {
    const n = name.trim();
    const bg = sanitizeHexInput(bgColorHex);
    const tx = sanitizeHexInput(textColorHex);

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
    const bg = sanitizeHexInput(bgColorHex);
    const tx = sanitizeHexInput(textColorHex);

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
                      onChange={(e) => setBgColorHex(sanitizeHexInput(e.target.value))}
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
                      onChange={(e) => setTextColorHex(sanitizeHexInput(e.target.value))}
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
            );
          }

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
      <Table<Category>
        columns={columns}
        items={items}
        loading={loading}
        skeletonRowCount={8}
        rowKey={(r) => r.categoryId}
        emptyText="카테고리가 없습니다."
      />

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
                    onChange={(e) => setBgColorHex(sanitizeHexInput(e.target.value))}
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
                    onChange={(e) => setTextColorHex(sanitizeHexInput(e.target.value))}
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

      {toastMsg ? (
        <div role="status" aria-live="polite" className={styles.toast}>
          <span className={styles.toastIcon} aria-hidden>
            <svg viewBox="0 0 24 24" className={styles.toastIconSvg}>
              <path
                d="M20 6L9 17l-5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className={styles.toastText}>{toastMsg}</span>
        </div>
      ) : null}
    </div>
  );
});
