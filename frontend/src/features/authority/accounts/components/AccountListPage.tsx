"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../styles/AccountListPage.module.css";
import { AccountRowView, AccountStatus, AccountType } from "../types";
import AccountFilters from "./AccountFilters";
import AccountTable from "./AccountTable";
import AccountCreateModal from "./AccountCreateModal";
import AccountEditModal from "./AccountEditModal";

import { accountsApi } from "../api/accountsApi";
import type { AccountRowDto } from "../api/dto";

type RoleFilter = "ALL" | AccountType;

function mapRow(dto: AccountRowDto): AccountRowView {
  const base = {
    accountId: dto.accountId,
    loginId: dto.loginId,
    accountType: dto.accountType,
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt ?? dto.createdAt,
    lastLoginAt: null,
    passwordChangedAt: null,
  };

  const p = dto.profile;

  if (dto.accountType === "STUDENT") {
    return {
      account: base,
      studentProfile: p
        ? {
            accountId: dto.accountId,
            studentNo: p.studentNo ?? "",
            name: p.name,
            email: p.email ?? null,
            phone: p.phone ?? null,
            deptId: p.deptId ?? 0,
            gradeLevel: p.gradeLevel ?? 1,
            academicStatus: (p.academicStatus as any) ?? "ENROLLED",
            majors: (p.majors as any) ?? [],
            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt ?? dto.createdAt,
          }
        : undefined,
    };
  }

  if (dto.accountType === "PROFESSOR") {
    return {
      account: base,
      professorProfile: p
        ? {
            accountId: dto.accountId,
            professorNo: p.professorNo ?? "",
            name: p.name,
            email: p.email ?? null,
            phone: p.phone ?? null,
            deptId: p.deptId ?? 0,
            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt ?? dto.createdAt,
          }
        : undefined,
    };
  }

  const ap = dto.adminProfile ?? (dto.profile as any);

  return {
    account: base,
    adminProfile: ap
      ? {
          accountId: dto.accountId,
          name: ap.name,
          email: ap.email ?? null,
          phone: ap.phone ?? null,
          memo: ap.memo ?? null,
          createdAt: dto.createdAt,
          updatedAt: dto.updatedAt ?? dto.createdAt,
        }
      : undefined,
  };
}

export default function AccountListPage() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [keywordDraft, setKeywordDraft] = useState("");
  const [keywordApplied, setKeywordApplied] = useState("");

  const [rows, setRows] = useState<AccountRowView[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<number | null>(null);

  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  async function fetchList() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await accountsApi.list({
        accountType: roleFilter === "ALL" ? undefined : roleFilter,
        keyword: keywordApplied || undefined,
        page: 1,
        size: 50,
      });

      const list = res?.items ?? [];
      setRows(list.map(mapRow));
    } catch (e: any) {
      setErrorMsg(e?.message ?? "목록 조회 실패");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const filteredRows = useMemo(() => {
    if (roleFilter === "ALL") return rows;
    return rows.filter((r) => r.account.accountType === roleFilter);
  }, [rows, roleFilter]);

  const onToggleStatus = async (accountId: number, current: AccountStatus, next: AccountStatus) => {
    if (current === next) return;

    // in-flight 가드
    if (pendingIds.has(accountId)) return;

    // optimistic update
    setRows((prev) =>
      prev.map((r) =>
        r.account.accountId === accountId ? { ...r, account: { ...r.account, status: next } } : r
      )
    );
    setPendingIds((prev) => new Set(prev).add(accountId));

    try {
      await accountsApi.updateStatus(accountId, next);
    } catch (e: any) {
      // 실패 시 원복
      setRows((prev) =>
        prev.map((r) =>
          r.account.accountId === accountId ? { ...r, account: { ...r.account, status: current } } : r
        )
      );
      alert(e?.message ?? "상태 변경 실패");
    } finally {
      setPendingIds((prev) => {
        const n = new Set(prev);
        n.delete(accountId);
        return n;
      });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>권한 관리 - 계정 관리</div>

      <div className={styles.headerRow}>
        <h1 className={styles.title}>계정 목록</h1>

        <div className={styles.actions}>
          <button className={styles.primaryBtn} type="button" onClick={() => setCreateOpen(true)}>
            계정 생성
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <AccountFilters
          role={roleFilter}
          keyword={keywordDraft}
          onChangeRole={setRoleFilter}
          onChangeKeyword={setKeywordDraft}
          onApply={() => {
            setKeywordApplied(keywordDraft);
            setTimeout(fetchList, 0);
          }}
        />

        {errorMsg && <div style={{ padding: 12, color: "#b91c1c" }}>{errorMsg}</div>}
        {loading ? (
          <div style={{ padding: 12 }}>로딩중...</div>
        ) : (
          <AccountTable
            rows={filteredRows}
            pendingIds={pendingIds}
            onToggleStatus={onToggleStatus}
            onClickEdit={(accountId) => {
              setEditingAccountId(accountId);
              setEditOpen(true);
            }}
          />
        )}
      </div>

      <AccountCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={async () => {
          setCreateOpen(false);
          await fetchList();
        }}
      />

      <AccountEditModal
        open={editOpen}
        accountId={editingAccountId}
        onClose={() => setEditOpen(false)}
        onSaved={async () => {
          setEditOpen(false);
          await fetchList();
        }}
      />
    </div>
  );
}
