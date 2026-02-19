"use client";

import styles from "../styles/AccountListPage.module.css";
import { AccountRowView, AccountStatus } from "../types";
import { ToggleSwitch } from "@/components/toggle/ToggleSwitch";
import { Button } from "@/components/button/Button"; // ✅

type Props = {
  rows: AccountRowView[];
  pendingIds: Set<number>;
  onToggleStatus: (accountId: number, current: AccountStatus, next: AccountStatus) => void;
  onClickEdit: (accountId: number) => void;
};

function roleLabel(t: string) {
  if (t === "STUDENT") return "학생";
  if (t === "PROFESSOR") return "교수";
  return "관리자";
}

function pickProfile(row: AccountRowView) {
  return row.studentProfile ?? row.professorProfile ?? row.adminProfile;
}

export default function AccountTable({ rows, pendingIds, onToggleStatus, onClickEdit }: Props) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: 160 }}>로그인 ID</th>
            <th style={{ width: 120 }}>계정 유형</th>
            <th style={{ width: 160 }}>이름</th>
            <th>이메일</th>
            <th style={{ width: 140 }}>생성일</th>
            <th style={{ width: 140 }}>활성/비활성</th>
            <th style={{ width: 120 }}>수정</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className={styles.empty} colSpan={7}>
                데이터가 없습니다.
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const p = pickProfile(row);
              const isPending = pendingIds.has(row.account.accountId);
              const checked = row.account.status === "ACTIVE";

              return (
                <tr key={row.account.accountId}>
                  <td>{row.account.loginId}</td>
                  <td>{roleLabel(row.account.accountType)}</td>
                  <td>{p?.name ?? "-"}</td>
                  <td>{p?.email ?? "-"}</td>
                  <td>{row.account.createdAt.slice(0, 10)}</td>
                  <td>
                    <ToggleSwitch
                      checked={checked}
                      disabled={isPending}
                      onChange={(chk) =>
                        onToggleStatus(
                          row.account.accountId,
                          row.account.status,
                          chk ? "ACTIVE" : "INACTIVE"
                        )
                      }
                    />
                  </td>
                  <td>
                    {/* ✅ 공용 Button 교체 (secondary variant, small override) */}
                    <Button
                      variant="secondary"
                      className={styles.customTableBtn}
                      onClick={() => onClickEdit(row.account.accountId)}
                      disabled={isPending}
                    >
                      수정
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
