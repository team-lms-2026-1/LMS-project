"use client";

import { Fragment } from "react";
import styles from "./ExtraOfferingSessionsExpandableTable.module.css";
import { Button } from "@/components/button";
import { StatusPill } from "@/components/status";

import type { ExtraOfferingStatus, ExtraSessionListItemDto } from "../../../api/types";
import { ExtraSessionDetailPanel } from "./ExtraSessionDetailPanel";

type Props = {
  offeringId: number;
  items: ExtraSessionListItemDto[];
  loading: boolean;
  offeringStatus: ExtraOfferingStatus;
  expandedSessionId: number | null;
  onToggle: (row: ExtraSessionListItemDto) => void;
  onReloadList?: () => void | Promise<void>;
};

export function ExtraOfferingSessionsExpandableTable({
  offeringId,
  offeringStatus,
  items,
  loading,
  expandedSessionId,
  onToggle,
  onReloadList,
}: Props) {
  const colCount = 7;

  return (
    <div className={styles.wrapper}>
      <table className={styles.table} aria-label="extra-sessions">
        <colgroup>
          <col style={{ width: "12%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
        </colgroup>

        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>회차명</th>
            <th className={styles.th}>회차포인트</th>
            <th className={styles.th}>회차인정시간</th>
            <th className={styles.th}>시작기간</th>
            <th className={styles.th}>마감기간</th>
            <th className={styles.th}>상태</th>
            <th className={styles.th}>관리</th>
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
                회차가 없습니다.
              </td>
            </tr>
          ) : (
            items.map((r) => {
              const isExpanded = expandedSessionId === r.sessionId;

              return (
                <Fragment key={r.sessionId}>
                  <tr
                    className={`${styles.tr} ${isExpanded ? styles.trExpanded : ""}`}
                    onClick={() => onToggle(r)}
                  >
                    <td className={styles.tdCenter}>{r.sessionName}</td>
                    <td className={styles.tdCenter}>{r.rewardPoint}</td>
                    <td className={styles.tdCenter}>{r.recognizedHours}</td>
                    <td className={styles.tdCenter}>{r.startAt}</td>
                    <td className={styles.tdCenter}>{r.endAt}</td>
                    <td className={styles.tdCenter}>
                      <StatusPill status={r.status as any} label={r.status} />
                    </td>
                    <td className={styles.tdCenter} onClick={(e) => e.stopPropagation()}>
                      <Button variant="secondary" onClick={() => onToggle(r)}>
                        {isExpanded ? "닫기" : "상세"}
                      </Button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className={styles.expandTr}>
                      <td colSpan={colCount} className={styles.expandTd}>
                        <ExtraSessionDetailPanel
                          offeringId={offeringId}
                          offeringStatus ={offeringStatus}
                          sessionId={r.sessionId}
                          onClose={() => onToggle(r)}
                          onReloadList={onReloadList}
                        />
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
