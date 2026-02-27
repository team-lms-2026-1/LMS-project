"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import styles from "../styles/AccountListPage.module.css";
import { AccountRowView, AccountStatus, AccountType } from "../types";
import AccountFilters from "./AccountFilters";
import AccountTable from "./AccountTable";
import AccountCreateModal from "./AccountCreateModal";
import AccountEditModal from "./AccountEditModal";

import { accountsApi } from "../api/accountsApi";
import type { AccountRowDto } from "../api/dto";

import { PaginationSimple, useListQuery } from "@/components/pagination";
import { Button } from "@/components/button/Button"; // ✅
import { useI18n } from "@/i18n/useI18n";

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
  const t = useI18n("authority.accounts.list.page");
  const SIZE = 10;

  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [keywordDraft, setKeywordDraft] = useState("");
  const [keywordApplied, setKeywordApplied] = useState("");
  const [deptFilter, setDeptFilter] = useState<number | null>(null); // ✅

  const [rows, setRows] = useState<AccountRowView[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<number | null>(null);

  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  // ✅ URL query 기반 pagination (UI는 1-based)
  const { page: pageRaw, setPage: setPageRaw } = useListQuery({
    defaultPage: 1,
    defaultSize: SIZE,
  });

  // ✅ page 정규화
  const page = useMemo(() => {
    const n = Number(pageRaw);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [pageRaw]);

  /**
   * ✅ 핵심: useListQuery의 setPage가 매 렌더마다 바뀌어도
   * safeSetPage는 "항상 같은 함수"로 유지 (effect 루프 방지)
   */
  const pageRef = useRef(page);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const setPageRef = useRef(setPageRaw);
  useEffect(() => {
    setPageRef.current = setPageRaw;
  }, [setPageRaw]);

  const safeSetPage = useCallback((next: number) => {
    const cur = pageRef.current;
    if (cur === next) return;
    setPageRef.current(next);
  }, []);

  const [totalPages, setTotalPages] = useState(1);

  // ✅ 수동 reload 트리거
  const [reloadTick, setReloadTick] = useState(0);
  const reload = useCallback(() => setReloadTick((t) => t + 1), []);

  // ✅ API params (0-based 변환)
  const apiParams = useMemo(() => {
    const kw = keywordApplied.trim();
    return {
      accountType: roleFilter === "ALL" ? undefined : roleFilter,
      keyword: kw.length ? kw : undefined,
      deptId: deptFilter ?? undefined, // ✅
      page: page,
      size: SIZE,
    };
  }, [roleFilter, keywordApplied, deptFilter, page]);

  // ✅ 의존성용 “문자열 키”로 고정 (object identity 흔들림 방지)
  const fetchKey = useMemo(() => {
    return JSON.stringify({
      accountType: apiParams.accountType ?? null,
      keyword: apiParams.keyword ?? null,
      deptId: apiParams.deptId ?? null, // ✅
      page: apiParams.page,
      size: apiParams.size,
      reloadTick,
    });
  }, [apiParams, reloadTick]);

  // ✅ 최신 요청만 반영
  const seqRef = useRef(0);

  useEffect(() => {
    let alive = true;
    const seq = ++seqRef.current;

    (async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await accountsApi.list(apiParams); // { items, total }

        if (!alive || seq !== seqRef.current) return;

        const total = Number(res.total ?? 0);
        const tp = Math.max(1, Math.ceil(total / SIZE));

        setTotalPages((prev) => (prev === tp ? prev : tp));

        // ✅ 페이지 범위 보정(필터/삭제로 페이지 줄었을 때)
        if (page > tp) {
          safeSetPage(tp);
          return;
        }

        setRows((res.items ?? []).map(mapRow));
      } catch (e: any) {
        if (!alive || seq !== seqRef.current) return;
        setErrorMsg(e?.message ?? t("messages.listLoadFailed"));
        setRows([]);
        setTotalPages(1);
      } finally {
        if (!alive || seq !== seqRef.current) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // ✅ fetchKey만 의존 (무한루프 차단)
  }, [fetchKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayRows = useMemo(() => {
    // 서버가 이미 accountType 필터링을 하면 rows 그대로 써도 됨.
    // 안전장치로 남겨도 괜찮음.
    if (roleFilter === "ALL") return rows;
    return rows.filter((r) => r.account.accountType === roleFilter);
  }, [rows, roleFilter]);

  const onToggleStatus = async (accountId: number, current: AccountStatus, next: AccountStatus) => {
    if (current === next) return;
    if (pendingIds.has(accountId)) return;

    setRows((prev) =>
      prev.map((r) =>
        r.account.accountId === accountId ? { ...r, account: { ...r.account, status: next } } : r
      )
    );
    setPendingIds((prev) => new Set(prev).add(accountId));

    try {
      await accountsApi.updateStatus(accountId, next);
    } catch (e: any) {
      setRows((prev) =>
        prev.map((r) =>
          r.account.accountId === accountId ? { ...r, account: { ...r.account, status: current } } : r
        )
      );
      alert(e?.message ?? t("messages.statusUpdateFailed"));
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
      <div className={styles.breadcrumb}>{t("breadcrumb")}</div>

      <div className={styles.headerRow}>
        <h1 className={styles.title}>{t("title")}</h1>
      </div>

      <div className={styles.card}>
        <AccountFilters
          role={roleFilter}
          keyword={keywordDraft}
          deptId={deptFilter} // ✅
          onChangeRole={(v) => {
            setRoleFilter(v);
            safeSetPage(1);
          }}
          onChangeKeyword={setKeywordDraft}
          onChangeDept={(d) => {
            // ✅
            setDeptFilter(d);
            safeSetPage(1);
          }}
          onApply={() => {
            setKeywordApplied(keywordDraft.trim());
            safeSetPage(1);
          }}
        />

        {errorMsg && <div style={{ padding: 12, color: "#b91c1c" }}>{errorMsg}</div>}

        {loading ? (
          <div style={{ padding: 12 }}>{t("loading")}</div>
        ) : (
          <AccountTable
            rows={displayRows}
            pendingIds={pendingIds}
            onToggleStatus={onToggleStatus}
            onClickEdit={(accountId) => {
              setEditingAccountId(accountId);
              setEditOpen(true);
            }}
          />
        )}

        <div className={styles.footerRow}>
          <div className={styles.footerLeft} />
          <div className={styles.footerCenter}>
            <PaginationSimple
              page={page}
              totalPages={totalPages}
              onChange={safeSetPage}
              disabled={loading}
            />
          </div>
          <div className={styles.footerRight}>
            <Button
              variant="primary"
              className={styles.customActionBtn}
              onClick={() => setCreateOpen(true)}
            >
              {t("createButton")}
            </Button>
          </div>
        </div>
      </div>

      <AccountCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={async () => {
          setCreateOpen(false);
          reload();
        }}
      />

      <AccountEditModal
        open={editOpen}
        accountId={editingAccountId}
        onClose={() => setEditOpen(false)}
        onSaved={async () => {
          setEditOpen(false);
          reload();
        }}
      />
    </div>
  );
}
