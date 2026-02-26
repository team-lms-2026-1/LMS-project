"use client";

import styles from "../styles/AccountListPage.module.css";
import { AccountRowView, AccountStatus } from "../types";
import { ToggleSwitch } from "@/components/toggle/ToggleSwitch";
import { Button } from "@/components/button/Button"; // ✅
import { useI18n } from "@/i18n/useI18n";

type Props = {
  rows: AccountRowView[];
  pendingIds: Set<number>;
  onToggleStatus: (accountId: number, current: AccountStatus, next: AccountStatus) => void;
  onClickEdit: (accountId: number) => void;
};

function pickProfile(row: AccountRowView) {
  return row.studentProfile ?? row.professorProfile ?? row.adminProfile;
}

export default function AccountTable({ rows, pendingIds, onToggleStatus, onClickEdit }: Props) {
  const tRoles = useI18n("authority.accounts.common.roles");
  const t = useI18n("authority.accounts.list.table");

  const roleLabel = (type: string) => {
    if (type === "STUDENT") return tRoles("STUDENT");
    if (type === "PROFESSOR") return tRoles("PROFESSOR");
    return tRoles("ADMIN");
  };

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: 160 }}>{t("headers.loginId")}</th>
            <th style={{ width: 120 }}>{t("headers.accountType")}</th>
            <th style={{ width: 160 }}>{t("headers.name")}</th>
            <th>{t("headers.email")}</th>
            <th style={{ width: 140 }}>{t("headers.createdAt")}</th>
            <th style={{ width: 140 }}>{t("headers.status")}</th>
            <th style={{ width: 120 }}>{t("headers.manage")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className={styles.empty} colSpan={7}>
                {t("emptyText")}
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
                  <td>{p?.name ?? t("fallback")}</td>
                  <td>{p?.email ?? t("fallback")}</td>
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
                      {t("editButton")}
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
