"use client";

import { Fragment } from "react";
import styles from "./ExtraOfferingApplicantsExpandableTable.module.css";
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";
import type { ExtraOfferingApplicantRowDto, ExtraOfferingApplicantSessionDto } from "../../../api/types";
import { completionStatusLabel } from "@/features/curricular-offering/utils/studentStatusLable";

type Props = {
  items: ExtraOfferingApplicantRowDto[];
  loading: boolean;
  expandedApplicationId: number | null;
  onToggle: (row: ExtraOfferingApplicantRowDto) => void;
};

const applyStatusView = (v: string) => {
  if (v === "APPLIED") return { status: "PENDING" as const, label: "신청" };
  if (v === "CANCELED") return { status: "CANCELED" as const, label: "취소" };
  return { status: "PENDING" as const, label: v };
};

const attendedView = (v: boolean) =>
  v
    ? { status: "ACTIVE" as const, label: "출석" }
    : { status: "INACTIVE" as const, label: "미출석" };

function SessionsTable({ sessions }: { sessions: ExtraOfferingApplicantSessionDto[] }) {
  if (!sessions || sessions.length === 0) {
    return <div className={styles.emptyInner}>회차가 없습니다.</div>;
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
          <th className={styles.innerTh}>회차명</th>
          <th className={styles.innerTh}>회차상태</th>
          <th className={styles.innerTh}>출석</th>
        </tr>
      </thead>
      <tbody>
        {sessions.map((s) => (
          <tr key={s.sessionId}>
            <td className={styles.innerTd}>{s.sessionTitle}</td>
            <td className={styles.innerTd}>
              <StatusPill status={s.sessionStatus as any} label={s.sessionStatus} />
            </td>
            <td className={styles.innerTd}>
              <StatusPill {...attendedView(s.isAttended)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ExtraOfferingApplicantsExpandableTable({
  items,
  loading,
  expandedApplicationId,
  onToggle,
}: Props) {
  const colCount = 7;

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
            <th className={styles.th}>학생명</th>
            <th className={styles.th}>학번</th>
            <th className={styles.th}>학년</th>
            <th className={styles.th}>소속학과</th>
            <th className={styles.th}>신청상태</th>
            <th className={styles.th}>이수상태</th>
            <th className={styles.th}>출석조회</th>
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
                신청 학생이 없습니다.
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
                        label={completionStatusLabel(r.completionStatus as any)}
                      />
                    </td>
                    <td className={styles.tdCenter} onClick={(e) => e.stopPropagation()}>
                      <Button variant="secondary" onClick={() => onToggle(r)}>
                        {isExpanded ? "닫기" : "조회"}
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
