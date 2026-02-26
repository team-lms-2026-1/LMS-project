"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import { useI18n } from "@/i18n/useI18n";
import type {
  DiagnosisNonRespondentItem,
  DiagnosisNonRespondentModalProps,
  DiagnosisNonRespondentPageItem,
  DiagnosisParticipantsItem,
} from "@/features/competencies/diagnosis/api/types";
import { NonRespondentTable } from "./NonRespondentTable";
import styles from "./DignosisNonRespondentModal.module.css";
import { fetchDiagnosisParticipants } from "@/features/competencies/diagnosis/api/DiagnosisApi";

const PAGE_SIZE = 10;

function isNonRespondentStatus(value?: string | null) {
  if (!value) return false;
  const status = String(value).toUpperCase();
  return (
    status === "PENDING" ||
    status === "NOT_SUBMITTED" ||
    status === "NOT_SUBMIT" ||
    status === "NOT_RESPONSE" ||
    status === "NOT_RESPONDED" ||
    status === "UNSUBMITTED" ||
    status === "UNANSWERED" ||
    status === "NOT_ANSWERED"
  );
}

function mapParticipants(items: DiagnosisParticipantsItem[]): DiagnosisNonRespondentItem[] {
  return items
    .filter((item) => isNonRespondentStatus(item?.status))
    .map((item, index) => ({
      id: item?.targetId ?? item?.studentNumber ?? index,
      studentNumber: item?.studentNumber ?? item?.studentNo ?? "-",
      name: item?.name ?? "-",
      email: item?.email ?? "-",
    }));
}

function buildPageItems(current: number, total: number): DiagnosisNonRespondentPageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: DiagnosisNonRespondentPageItem[] = [1];
  const showStartEllipsis = current > 4;
  const showEndEllipsis = current < total - 3;

  let start = Math.max(2, current - 1);
  let end = Math.min(total - 1, current + 1);

  if (!showStartEllipsis) {
    start = 2;
    end = 4;
  }
  if (!showEndEllipsis) {
    start = total - 3;
    end = total - 1;
  }

  if (showStartEllipsis) items.push("ellipsis");
  for (let p = start; p <= end; p += 1) items.push(p);
  if (showEndEllipsis) items.push("ellipsis");
  items.push(total);

  return items;
}

export function DignosisNonRespondentModal({
  open,
  onClose,
  deptName,
  dignosisId,
  items,
  onSendEmail,
}: DiagnosisNonRespondentModalProps) {
  const t = useI18n("competency.adminDiagnosis.nonRespondentModal");
  const [remoteItems, setRemoteItems] = useState<DiagnosisNonRespondentItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const safeItems = remoteItems ?? items ?? [];
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(safeItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = safeItems.slice(startIndex, startIndex + PAGE_SIZE);

  const pages = useMemo(
    () => buildPageItems(currentPage, totalPages),
    [currentPage, totalPages]
  );

  useEffect(() => {
    if (!open) return;
    setPage(1);
  }, [open, safeItems.length]);

  useEffect(() => {
    if (!open) return;
    if (!dignosisId) {
      setRemoteItems(null);
      return;
    }
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const res = await fetchDiagnosisParticipants(dignosisId, { size: 1000 });
        if (!alive) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        setRemoteItems(mapParticipants(list));
      } catch {
        if (!alive) return;
        setRemoteItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, dignosisId]);

  useEffect(() => {
    if (page <= totalPages) return;
    setPage(totalPages);
  }, [page, totalPages]);

  const deptLabel = deptName?.trim() ? deptName : "전체";
  const handleSendEmail = async () => {
    if (!onSendEmail) {
      return;
    }
    setSending(true);
    try {
      await onSendEmail(safeItems);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={t("title")}
      footer={
        <div className={styles.footerActions}>
          <Button variant="secondary" onClick={onClose}>
            {t("buttons.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSendEmail}
            disabled={safeItems.length === 0 || sending}
          >
            {t("buttons.sendEmail")}
          </Button>
        </div>
      }
    >
      <div className={styles.root}>
        <div className={styles.subTitle}>{t("subtitle", { dept: deptLabel })}</div>

        <div className={styles.tableWrap}>
          <NonRespondentTable items={pageItems} startIndex={startIndex} loading={loading} />
        </div>

        {totalPages > 1 && (
          <div className={styles.paginationWrap}>
            <div className={styles.pagination}>
              <button
                type="button"
                className={`${styles.pageButton} ${currentPage === 1 ? styles.pageButtonDisabled : ""}`}
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label={t("aria.prevPage")}
              >
                {"<"}
              </button>
              {pages.map((item, idx) =>
                item === "ellipsis" ? (
                  <span key={`ellipsis-${idx}`} className={styles.ellipsis}>
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    className={`${styles.pageButton} ${item === currentPage ? styles.pageButtonActive : ""}`}
                    onClick={() => setPage(item)}
                    aria-current={item === currentPage ? "page" : undefined}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                type="button"
                className={`${styles.pageButton} ${currentPage === totalPages ? styles.pageButtonDisabled : ""}`}
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label={t("aria.nextPage")}
              >
                {">"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
