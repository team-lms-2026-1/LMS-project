"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";

import { Table, type TableColumn } from "@/components/table";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { useI18n } from "@/i18n/useI18n";

import styles from "./CategoryTable.module.css";
import type {
  Category,
  CategoryScope,
  CreateCategoryRequestDto,
  UpdateCategoryRequestDto,
} from "../../api/types";
import { categoriesApi } from "../../api/categoriesApi";

import DeleteModal from "../modal/DeleteModal.client";

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

export type CategoryTablePageHandle = {
  isDirty: () => boolean;
  showLeaveToast: () => void;
};

export const CategoryTablePage = forwardRef<CategoryTablePageHandle, Props>(
  function CategoryTablePageInner({ scope, items, loading, onReload }: Props, ref) {
    const t = useI18n("community.categories.table");
    const MAX_CATEGORY_NAME_LEN = 15;

    const clampCategoryName = (value: string) => {
      return Array.from(value ?? "").slice(0, MAX_CATEGORY_NAME_LEN).join("");
    };

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

    // ✅ 학과 관리처럼 react-hot-toast로 통일
    const toastLeave = useCallback(() => {
      toast.error(t("leaveGuard"));
    }, [t]);

    const toastApiError = useCallback((e: any, fallback: string) => {
      toast.error(e?.body?.error?.message || e?.message || fallback);
    }, []);

    // ✅ 부모에서 isDirty / 토스트를 호출 가능하게 노출
    useImperativeHandle(
      ref,
      () => ({
        isDirty: () => isDirty,
        showLeaveToast: toastLeave,
      }),
      [isDirty, toastLeave]
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
        toastLeave();
      };

      window.addEventListener("popstate", onPopState);
      return () => window.removeEventListener("popstate", onPopState);
    }, [isDirty, toastLeave]);

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
        toastLeave();
      };

      document.addEventListener("click", onClickCapture, true);
      return () => document.removeEventListener("click", onClickCapture, true);
    }, [isDirty, toastLeave]);

    const submitAdd = async () => {
      const n = name.trim();
      const bg = sanitizeHexInput(bgColorHex);
      const tx = sanitizeHexInput(textColorHex);

      if (!n) return toast.error(t("errors.nameRequired"));
      if (!bg || !tx) return toast.error(t("errors.colorRequired"));

      const body: CreateCategoryRequestDto = { name: n, bgColorHex: bg, textColorHex: tx };

      try {
        await categoriesApi.create(scope, body);
        toast.success(t("toasts.added"));
        await onReload();
        cancelInline();
      } catch (e: any) {
        toastApiError(e, t("errors.addFailed"));
      }
    };

    const submitEdit = async (id: number) => {
      const n = name.trim();
      const bg = sanitizeHexInput(bgColorHex);
      const tx = sanitizeHexInput(textColorHex);

      if (!n) return toast.error(t("errors.nameRequired"));
      if (!bg || !tx) return toast.error(t("errors.colorRequired"));

      const body: UpdateCategoryRequestDto = { name: n, bgColorHex: bg, textColorHex: tx };

      try {
        await categoriesApi.update(scope, id, body);
        toast.success(t("toasts.updated"));
        await onReload();
        cancelInline();
      } catch (e: any) {
        toastApiError(e, t("errors.updateFailed"));
      }
    };

    // =========================
    // ✅ 삭제 모달 상태/핸들러
    // =========================
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const openDelete = (c: Category) => {
      if (isDirty) {
        toastLeave();
        return;
      }
      setDeleteTarget(c);
      setDeleteOpen(true);
    };

    const closeDelete = () => {
      if (deleteLoading) return;
      setDeleteOpen(false);
      setDeleteTarget(null);
    };

    const confirmDelete = async () => {
      if (!deleteTarget) return;

      setDeleteLoading(true);
      try {
        await categoriesApi.remove(scope, deleteTarget.categoryId);
        toast.success(t("toasts.deleted"));
        await onReload();
        closeDelete();
      } catch (e: any) {
        toastApiError(e, t("errors.deleteFailed"));
      } finally {
        setDeleteLoading(false);
      }
    };

    const columns: Array<TableColumn<Category>> = [
      { header: t("headers.id"), align: "center", width: 120, render: (r) => r.categoryId },
      {
        header: t("headers.category"),
        align: "center",
        render: (r) => {
          if (isEditing(r.categoryId)) {
            return (
              <div className={styles.inlineForm}>
                <input
                  className={styles.nameInput}
                  value={name}
                  onChange={(e) => setName(clampCategoryName(e.target.value))}
                  placeholder={t("placeholders.name")}
                  maxLength={MAX_CATEGORY_NAME_LEN}
                  disabled={loading}
                />

                <div className={styles.colorRow}>
                  <div className={styles.colorPickerGroup}>
                    <span className={styles.colorLabel}>{t("labels.bgColor")}</span>
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
                    <span className={styles.colorLabel}>{t("labels.textColor")}</span>
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
                    {name || t("labels.preview")}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <Badge bgColor={r.bgColorHex} textColor={r.textColorHex}>
              {r.name}
            </Badge>
          );
        },
      },
      {
        header: t("headers.manage"),
        align: "center",
        width: 220,
        stopRowClick: true,
        render: (r) => {
          const editing = isEditing(r.categoryId);

          if (editing) {
            return (
              <div className={styles.manageCell}>
                <Button variant="primary" onClick={() => submitEdit(r.categoryId)} disabled={loading}>
                  {t("buttons.save")}
                </Button>
                <Button variant="danger" onClick={cancelInline} disabled={loading}>
                  {t("buttons.cancel")}
                </Button>
              </div>
            );
          }

          return (
            <div className={styles.manageCell}>
              <Button variant="secondary" onClick={() => openEdit(r)} disabled={loading || isAdding}>
                {t("buttons.edit")}
              </Button>
              <Button
                variant="danger"
                onClick={() => openDelete(r)}
                disabled={loading || isAdding || editingId !== null || deleteLoading}
              >
                {t("buttons.delete")}
              </Button>
            </div>
          );
        },
      },
    ];

    return (
      <div className={styles.wrap}>
        <Table<Category>
          columns={columns}
          items={items}
          loading={loading}
          skeletonRowCount={8}
          rowKey={(r) => r.categoryId}
          emptyText={t("emptyText")}
        />

        <div className={styles.addArea}>
          {isAdding ? (
            <div className={styles.addRow}>
              <div className={styles.addFormLeft}>
                <input
                  className={styles.nameInput}
                  value={name}
                  onChange={(e) => setName(clampCategoryName(e.target.value))}
                  placeholder={t("placeholders.name")}
                  maxLength={MAX_CATEGORY_NAME_LEN}
                  disabled={loading}
                />

                <div className={styles.colorRow}>
                  <div className={styles.colorPickerGroup}>
                    <span className={styles.colorLabel}>{t("labels.bgColor")}</span>
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
                    <span className={styles.colorLabel}>{t("labels.textColor")}</span>
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
                    {name || t("labels.preview")}
                  </span>
                </div>
              </div>

              <div className={styles.addFormRight}>
                <Button variant="primary" onClick={submitAdd} disabled={loading}>
                  {t("buttons.done")}
                </Button>
                <Button variant="danger" onClick={cancelInline} disabled={loading}>
                  {t("buttons.cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <button type="button" className={styles.addButton} onClick={openAdd} disabled={loading || editingId !== null}>
              <span className={styles.plus}>＋</span>
              <span className={styles.addText}>{t("buttons.addCategory")}</span>
            </button>
          )}
        </div>

        {/* ✅ 삭제 확인 모달 */}
        <DeleteModal
          open={deleteOpen}
          targetLabel={t("targetLabel")}
          targetTitle={deleteTarget?.name}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onClose={closeDelete}
        />
      </div>
    );
  }
);
