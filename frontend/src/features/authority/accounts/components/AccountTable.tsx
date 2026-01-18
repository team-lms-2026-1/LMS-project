"use client";

import styles from "../styles/AccountListPage.module.css";
import { AccountRowView, AccountStatus } from "../types";

type Props = {
  rows: AccountRowView[];
  onToggleStatus: (accountId: number, next: AccountStatus) => void;
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

export default function AccountTable({ rows, onToggleStatus, onClickEdit }: Props) {
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
              return (
                <tr key={row.account.accountId}>
                  <td>{row.account.loginId}</td>
                  <td>{roleLabel(row.account.accountType)}</td>
                  <td>{p?.name ?? "-"}</td>
                  <td>{p?.email ?? "-"}</td>
                  <td>{row.account.createdAt.slice(0, 10)}</td>
                  <td>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={row.account.status === "ACTIVE"}
                        onChange={(e) =>
                          onToggleStatus(row.account.accountId, e.target.checked ? "ACTIVE" : "INACTIVE")
                        }
                      />
                      <span className={styles.slider} />
                    </label>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.smallBtn}
                      onClick={() => onClickEdit(row.account.accountId)}
                    >
                      수정
                    </button>
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
