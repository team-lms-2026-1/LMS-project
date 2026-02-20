"use client";

import { Fragment } from "react";
import styles from "./ExtraOfferingApplicantsExpandableTable.module.css";
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";
import type { ExtraOfferingApplicantRowDto, ExtraOfferingApplicantSessionDto } from "../../../api/types";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  items: ExtraOfferingApplicantRowDto[];
  loading: boolean;
  expandedApplicationId: number | null;
  onToggle: (row: ExtraOfferingApplicantRowDto) => void;
};

export function ExtraOfferingApplicantsExpandableTable({
  items,
  loading,
  expandedApplicationId,
  onToggle,
}: Props) {
  const t = useI18n("extraCurricular.adminOfferingDetail.students");
  const tApply = useI18n("extraCurricular.status.apply");
  const tSession = useI18n("extraCurricular.status.session");
  const tAttended = useI18n("extraCurricular.status.attended");
  const tCompletion = useI18n("curricular.status.completion");
  const colCount = 7;

  const applyStatusView = (v: string) => {
    if (v === "APPLIED") return { status: "PENDING" as const, label: tApply("APPLIED") };
    if (v === "CANCELED") return { status: "CANCELED" as const, label: tApply("CANCELED") };
    return { status: "PENDING" as const, label: v };
  };

  const attendedView = (v: boolean) =>
    v
      ? { status: "ACTIVE" as const, label: tAttended("ATTENDED") }
      : { status: "INACTIVE" as const, label: tAttended("ABSENT") };

  const completionStatusLabel = (value: string) => {
    switch (value) {
      case "IN_PROGRESS":
        return tCompletion("IN_PROGRESS");
      case "PASSED":
        return tCompletion("PASSED");
      case "FAILED":
        return tCompletion("FAILED");
      default:
        return value;
    }
  };

  const sessionStatusLabel = (value: string) => {
    switch (value) {
      case "OPEN":
        return tSession("OPEN");
      case "CLOSED":
        return tSession("CLOSED");
      case "CANCELED":
        return tSession("CANCELED");
      default:
        return value;
    }
  };

  const SessionsTable = ({ sessions }: { sessions: ExtraOfferingApplicantSessionDto[] }) => {
    if (!sessions || sessions.length === 0) {
      return <div className={styles.emptyInner}>{t("messages.noSessions")}</div>;
    }

    return (
      <table className={styles.innerTable} aria-label="extra-offering-sessions">
        <colgroup>
          <col style={{ width: "45%" }} />
          <col style={{ width: "30%" }} />
          <col style={{ width: "25%" }} />
        </colgroup>
        <thead className={styles.innerThead}>
          <tr>
            <th className={styles.innerTh}>{t("innerHeaders.sessionName")}</th>
            <th className={styles.innerTh}>{t("innerHeaders.sessionStatus")}</th>
            <th className={styles.innerTh}>{t("innerHeaders.attendance")}</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.sessionId}>
              <td className={styles.innerTd}>{s.sessionTitle}</td>
              <td className={styles.innerTd}>
                <StatusPill status={s.sessionStatus as any} label={sessionStatusLabel(s.sessionStatus)} />
              </td>
              <td className={styles.innerTd}>
                <StatusPill {...attendedView(s.isAttended)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className={styles.wrapper}>
      <table className={styles.table} aria-label="extra-offering-applicants">
        <colgroup>
          <col style={{ width: "14%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "16%" }} />
        </colgroup>

        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>{t("headers.studentName")}</th>
            <th className={styles.th}>{t("headers.studentNo")}</th>
            <th className={styles.th}>{t("headers.gradeLevel")}</th>
            <th className={styles.th}>{t("headers.deptName")}</th>
            <th className={styles.th}>{t("headers.applyStatus")}</th>
            <th className={styles.th}>{t("headers.completionStatus")}</th>
            <th className={styles.th}>{t("headers.attendanceAction")}</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className={styles.skeletonRow}>
                  {Array.from({ length: colCount }).map((__, j) => (
                    <td key={j} className={styles.td}>
                      <div className={styles.skeleton} />
                    </td>
                  ))}
                </tr>
              ))}
            </>
          ) : items.length === 0 ? (
            <tr>
              <td className={styles.empty} colSpan={colCount}>
                {t("emptyText")}
              </td>
            </tr>
          ) : (
            items.map((r) => {
              const isExpanded = expandedApplicationId === r.applicationId;

              return (
                <Fragment key={r.applicationId}>
                  <tr
                    className={`${styles.tr} ${isExpanded ? styles.trExpanded : ""}`}
                    onClick={() => onToggle(r)}
                  >
                    <td className={styles.tdCenter}>{r.studentName}</td>
                    <td className={styles.tdCenter}>{r.studentNo}</td>
                    <td className={styles.tdCenter}>{r.gradeLevel}</td>
                    <td className={styles.tdCenter}>{r.deptName}</td>
                    <td className={styles.tdCenter}>
                      <StatusPill {...applyStatusView(r.applyStatus)} />
                    </td>
                    <td className={styles.tdCenter}>
                      <StatusPill
                        status={r.completionStatus as any}
                        label={completionStatusLabel(r.completionStatus)}
                      />
                    </td>
                    <td className={styles.tdCenter} onClick={(e) => e.stopPropagation()}>
                      <Button variant="secondary" onClick={() => onToggle(r)}>
                        {isExpanded ? t("buttons.close") : t("buttons.view")}
                      </Button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className={styles.expandTr}>
                      <td colSpan={colCount} className={styles.expandTd}>
                        <SessionsTable sessions={r.sessions} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
