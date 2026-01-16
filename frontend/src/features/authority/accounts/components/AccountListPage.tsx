"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../styles/AccountListPage.module.css";
import { AccountRowView, AccountStatus, AccountType } from "../types";
import AccountFilters from "./AccountFilters";
import AccountTable from "./AccountTable";
import AccountCreateModal from "./AccountCreateModal";
import AccountEditModal from "./AccountEditModal";

import { accountsApi } from "../api/accountsApi";
import { AccountRowDto } from "../api/dto";

type RoleFilter = "ALL" | AccountType;

function mapRow(dto: AccountRowDto): AccountRowView {
  const base = {
    accountId: dto.accountId,
    loginId: dto.loginId,
    accountType: dto.accountType,
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
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

            // ✅ 새 규칙 필드명으로 매핑
            deptId: p.deptId ?? 0,
            gradeLevel: p.gradeLevel ?? 1,
            academicStatus: (p.academicStatus as any) ?? "ENROLLED",
            majors: (p.majors as any) ?? [],

            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt,
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

            // ✅ deptId로 통일
            deptId: p.deptId ?? 0,

            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt,
          }
        : undefined,
    };
  }

  return {
    account: base,
    adminProfile: p
      ? {
          accountId: dto.accountId,
          name: p.name,
          email: p.email ?? null,
          phone: p.phone ?? null,
          memo: p.memo ?? null,
          createdAt: dto.createdAt,
          updatedAt: dto.updatedAt,
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

  async function fetchList() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await accountsApi.list({
        accountType: roleFilter === "ALL" ? undefined : roleFilter,
        keyword: keywordApplied || undefined,
        page: 1,
        size: 10,
      });
      setRows(res.items.map(mapRow));
    } catch (e: any) {
      setErrorMsg(e?.message ?? "목록 조회 실패");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // 최초 진입 시 1회
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 카테고리 버튼 변경 시 즉시 반영(스크린샷 요구사항)
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const editingRow = useMemo(() => {
    if (!editingAccountId) return null;
    return rows.find((r) => r.account.accountId === editingAccountId) ?? null;
  }, [rows, editingAccountId]);

  const onToggleStatus = async (accountId: number, next: AccountStatus) => {
    try {
      await accountsApi.updateStatus(accountId, next);
      // 낙관적 업데이트
      setRows((prev) =>
        prev.map((r) =>
          r.account.accountId === accountId ? { ...r, account: { ...r.account, status: next } } : r
        )
      );
    } catch (e: any) {
      alert(e?.message ?? "상태 변경 실패");
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
            // “검색 버튼 눌렀을 때”만 적용
            setTimeout(fetchList, 0);
          }}
        />

        {errorMsg && <div style={{ padding: 12, color: "#b91c1c" }}>{errorMsg}</div>}
        {loading ? (
          <div style={{ padding: 12 }}>로딩중...</div>
        ) : (
          <AccountTable
            rows={rows}
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
        row={editingRow}
        onClose={() => setEditOpen(false)}
        onSaved={async () => {
          setEditOpen(false);
          await fetchList();
        }}
      />
    </div>
  );
}
