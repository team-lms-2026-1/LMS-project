"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/AccountModal.module.css";
import type { AccountType, MajorType } from "../types";
import { accountsApi } from "../api/accountsApi";
import type { AccountRowDto } from "../api/dto";

export type AccountEditModalProps = {
  open: boolean;
  accountId: number | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

type FormState = {
  accountType: AccountType;
  loginId: string;

  name: string;
  email: string;
  phone: string;

  status: "ACTIVE" | "INACTIVE";

  // STUDENT/PROFESSOR
  deptId: number;

  // STUDENT
  gradeLevel: number;
  academicStatus: "ENROLLED" | "LEAVE" | "DROPPED" | "GRADUATED";

  primaryMajorId: number;
  useMinor: boolean;
  minorMajorId: number;
  useDouble: boolean;
  doubleMajorId: number;

  // ADMIN
  memo: string;

  // 비밀번호 변경(선택)
  newPassword: string;
};

const emptyForm: FormState = {
  accountType: "STUDENT",
  loginId: "",

  name: "",
  email: "",
  phone: "",

  status: "ACTIVE",

  deptId: 0,

  gradeLevel: 1,
  academicStatus: "ENROLLED",

  primaryMajorId: 0,
  useMinor: false,
  minorMajorId: 0,
  useDouble: false,
  doubleMajorId: 0,

  memo: "",

  newPassword: "",
};

function isValidPassword(v: string) {
  if (!v.trim()) return true; // 수정 시 비밀번호는 선택
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(v);
}

function isValidEmail(v: string) {
  if (!v.trim()) return true;
  return v.includes("@");
}

function isValidPhone(v: string) {
  if (!v.trim()) return true;
  return /^\d{3}-\d{4}-\d{4}$/.test(v);
}

function pickMajors(detail: any): Array<{ majorId: number; majorType: MajorType }> {
  const majors = detail?.profile?.majors ?? detail?.studentProfile?.majors ?? [];
  return Array.isArray(majors) ? majors : [];
}

/**
 * ✅ 서버 detail -> FormState 변환
 * - 백엔드 응답이 profile/adminProfile 중 어느 형태든 최대한 흡수
 */
function makeFormFromDetail(detail: any): FormState {
  const type: AccountType = detail.accountType;
  const status = detail.status as "ACTIVE" | "INACTIVE";

  const profile =
    type === "ADMIN"
      ? (detail.adminProfile ?? detail.profile ?? {})
      : (detail.profile ?? detail.studentProfile ?? {});

  const next: FormState = {
    ...emptyForm,
    accountType: type,
    loginId: detail.loginId ?? "",
    status: status ?? "ACTIVE",

    name: profile.name ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",

    memo: profile.memo ?? "",
    newPassword: "",
  };

  if (type === "STUDENT") {
    next.deptId = Number(profile.deptId ?? 0);
    next.gradeLevel = Number(profile.gradeLevel ?? 1);
    next.academicStatus = (profile.academicStatus ?? "ENROLLED") as any;

    const majors = pickMajors(detail);
    next.primaryMajorId = Number(majors.find((m: any) => m.majorType === "PRIMARY")?.majorId ?? 0);

    const minor = Number(majors.find((m: any) => m.majorType === "MINOR")?.majorId ?? 0);
    const dbl = Number(majors.find((m: any) => m.majorType === "DOUBLE")?.majorId ?? 0);

    next.useMinor = minor > 0;
    next.minorMajorId = minor;

    next.useDouble = dbl > 0;
    next.doubleMajorId = dbl;
  }

  if (type === "PROFESSOR") {
    next.deptId = Number(profile.deptId ?? 0);
  }

  // ADMIN은 dept/major 불필요
  return next;
}

const numericKeys = new Set<keyof FormState>([
  "deptId",
  "gradeLevel",
  "primaryMajorId",
  "minorMajorId",
  "doubleMajorId",
]);

export default function AccountEditModal({ open, accountId, onClose, onSaved }: AccountEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const [depts, setDepts] = useState<Array<{ deptId: number; deptName: string }>>([]);
  const [majorsByDept, setMajorsByDept] = useState<Array<{ majorId: number; majorName: string }>>([]);
  const [majorsAll, setMajorsAll] = useState<Array<{ majorId: number; majorName: string }>>([]);

  // ✅ 초기 하이드레이션(서버 값 주입 중) 여부
  const isHydratingRef = useRef(false);

  // body scroll lock + ESC
  useEffect(() => {
    if (!open || !accountId) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      isHydratingRef.current = true;

      try {
        // 1) 학과 목록
        const deptList = await accountsApi.listDepts();
        setDepts(deptList);

        // 2) 상세(학생이면 deptId/majors 포함되어야 함)
        const detail = await accountsApi.detail(accountId);
        const next = makeFormFromDetail(detail);

        // 3) 학생이면: deptId로 주전공 옵션 로드
        if (next.accountType === "STUDENT" && next.deptId) {
          const majorsDept = await accountsApi.listMajorsByDept(next.deptId).catch(() => []);
          setMajorsByDept(majorsDept.map((m: any) => ({ majorId: m.majorId, majorName: m.majorName })));
        } else {
          setMajorsByDept([]);
        }

        // 4) ✅ 전체 전공(부/복수전공용) - 현재 /majors/dropdown이 없으니 "학과 전체 순회"로 임시 구성
        const majorsAllFallback = async () => {
          const results = await Promise.all(
            deptList.map((d) => accountsApi.listMajorsByDept(d.deptId).catch(() => []))
          );
          const flat = results.flat();
          const map = new Map<number, { majorId: number; majorName: string }>();
          flat.forEach((m: any) => map.set(m.majorId, { majorId: m.majorId, majorName: m.majorName }));
          return Array.from(map.values());
        };

        const allMajors = await majorsAllFallback();
        setMajorsAll(allMajors);

        // 5) 마지막에 폼 세팅
        setForm(next);
      } catch (e: any) {
        setError(e?.message ?? "상세 조회 실패");
        setForm(emptyForm);
        setMajorsByDept([]);
        setMajorsAll([]);
      } finally {
        isHydratingRef.current = false;
        setLoading(false);
      }
    };

    load();
  }, [open, accountId]);


  // ✅ deptId 변경 시: 주전공 리스트 갱신 (학생만, 그리고 사용자 변경일 때만)
  useEffect(() => {
    if (!open) return;
    if (form.accountType !== "STUDENT") return;

    // ✅ 서버 상세값으로 초기 세팅 중이면 스킵 (주전공 초기화 방지)
    if (isHydratingRef.current) return;

    (async () => {
      if (!form.deptId) {
        setMajorsByDept([]);
        setForm((p) => ({ ...p, primaryMajorId: 0 }));
        return;
      }

      const majorsDept = await accountsApi.listMajorsByDept(form.deptId).catch(() => []);
      setMajorsByDept(majorsDept.map((m: any) => ({ majorId: m.majorId, majorName: m.majorName })));

      // ✅ 사용자가 학과 바꾸면 주전공 리셋
      setForm((p) => ({ ...p, primaryMajorId: 0 }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.deptId, open, form.accountType]);

  const onChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const t = e.target as HTMLInputElement;

      if (t.type === "checkbox") {
        const checked = (t as HTMLInputElement).checked;
        setForm((prev) => ({ ...prev, [key]: checked } as FormState));
        return;
      }

      // ✅ select의 숫자값도 Number로 변환 (deptId/majorId/gradeLevel)
      const raw = (e.target as HTMLInputElement).value;
      const value = numericKeys.has(key) ? Number(raw) : raw;

      setForm((prev) => ({ ...prev, [key]: value } as FormState));
    };

  const canSave = useMemo(() => {
    if (!accountId) return false;
    if (saving || loading) return false;

    if (!form.name.trim()) return false;
    if (!isValidEmail(form.email)) return false;
    if (!isValidPhone(form.phone)) return false;
    if (!isValidPassword(form.newPassword)) return false;

    if (form.accountType === "STUDENT") {
      if (!form.deptId) return false;
      if (!form.primaryMajorId) return false;
      if (form.useMinor && !form.minorMajorId) return false;
      if (form.useDouble && !form.doubleMajorId) return false;
    }

    if (form.accountType === "PROFESSOR") {
      if (!form.deptId) return false;
    }

    return true;
  }, [accountId, saving, loading, form]);

  const onResetPassword = async () => {
    if (!accountId) return;
    try {
      await accountsApi.resetPassword(accountId);
      alert("비밀번호 초기화 요청이 완료되었습니다.");
    } catch (e: any) {
      alert(e?.message ?? "비밀번호 초기화 실패");
    }
  };

  const onSubmit = async () => {
    if (!accountId || !canSave) return;

    setSaving(true);
    setError(null);
    try {
      if (form.accountType === "ADMIN") {
        await accountsApi.update(accountId, {
          status: form.status,
          adminProfile: {
            name: form.name,
            email: form.email || null,
            phone: form.phone || null,
            memo: form.memo || null,
          },
          ...(form.newPassword.trim() ? { password: form.newPassword } : {}),
        });
        await onSaved();
        return;
      }

      if (form.accountType === "PROFESSOR") {
        await accountsApi.update(accountId, {
          status: form.status,
          profile: {
            name: form.name,
            email: form.email || null,
            phone: form.phone || null,
            deptId: form.deptId,
          },
          ...(form.newPassword.trim() ? { password: form.newPassword } : {}),
        });
        await onSaved();
        return;
      }

      // STUDENT
      const majors: Array<{ majorId: number; majorType: MajorType }> = [
        { majorId: form.primaryMajorId, majorType: "PRIMARY" },
        ...(form.useMinor ? [{ majorId: form.minorMajorId, majorType: "MINOR" as const }] : []),
        ...(form.useDouble ? [{ majorId: form.doubleMajorId, majorType: "DOUBLE" as const }] : []),
      ];

      await accountsApi.update(accountId, {
        status: form.status,
        profile: {
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          deptId: form.deptId,
          gradeLevel: form.gradeLevel,
          academicStatus: form.academicStatus,
          majors,
        },
        ...(form.newPassword.trim() ? { password: form.newPassword } : {}),
      });

      await onSaved();
    } catch (e: any) {
      setError(e?.message ?? "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const typeLabel =
    form.accountType === "STUDENT" ? "학생" : form.accountType === "PROFESSOR" ? "교수" : "관리자";

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>계정 수정</h2>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.headerLabel}>유형</span>
            <span className={styles.headerLabel} style={{ color: "#111827" }}>
              {typeLabel}
            </span>
          </div>
        </div>

        <div className={styles.tabs}>
          {(["STUDENT", "PROFESSOR", "ADMIN"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`${styles.tab} ${form.accountType === t ? styles.active : ""}`}
              disabled
              style={{ cursor: "default", opacity: form.accountType === t ? 1 : 0.55 }}
              aria-disabled="true"
            >
              {t === "STUDENT" ? "학생" : t === "PROFESSOR" ? "교수" : "관리자"}
            </button>
          ))}
        </div>

        {error && <div style={{ marginBottom: 12, color: "#b91c1c", fontSize: 13 }}>{error}</div>}
        {loading ? <div style={{ padding: 12 }}>불러오는 중...</div> : null}

        <div className={styles.grid}>
          {/* 좌측 */}
          <section className={styles.col}>
            <div className={styles.field}>
              <label className={styles.label}>ID</label>
              <input className={styles.input} value={form.loginId} disabled />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>현재 비밀번호</label>
              <div className={styles.inlineRow}>
                <input className={styles.input} value={"********"} disabled />
                <button type="button" className={styles.subBtn} onClick={onResetPassword} disabled={!accountId}>
                  초기화
                </button>
              </div>
              <div className={styles.idHint}>현재 비밀번호는 보안상 표시/조회가 불가하여 마스킹 처리됩니다.</div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>새 비밀번호(선택)</label>
              <input
                className={styles.input}
                value={form.newPassword}
                type="password"
                onChange={onChange("newPassword")}
                placeholder="변경 시 입력"
              />
              {!isValidPassword(form.newPassword) && (
                <div style={{ marginTop: 6, fontSize: 12, color: "#b91c1c" }}>
                  영문/숫자/특수문자 포함 6자 이상
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>이름</label>
              <input className={styles.input} value={form.name} onChange={onChange("name")} />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>이메일</label>
              <input className={styles.input} value={form.email} onChange={onChange("email")} />
              {!isValidEmail(form.email) && <div style={{ marginTop: 6, fontSize: 12, color: "#b91c1c" }}>@ 포함</div>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>연락처</label>
              <input className={styles.input} value={form.phone} onChange={onChange("phone")} />
              {!isValidPhone(form.phone) && (
                <div style={{ marginTop: 6, fontSize: 12, color: "#b91c1c" }}>000-0000-0000 형식</div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>상태</label>
              <select className={styles.select} value={form.status} onChange={onChange("status")}>
                <option value="ACTIVE">활성</option>
                <option value="INACTIVE">비활성</option>
              </select>
            </div>

            {form.accountType === "STUDENT" && (
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>학년</label>
                  <select className={styles.select} value={form.gradeLevel} onChange={onChange("gradeLevel")}>
                    {[1, 2, 3, 4].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>재학 상태</label>
                  <select className={styles.select} value={form.academicStatus} onChange={onChange("academicStatus")}>
                    <option value="ENROLLED">재학</option>
                    <option value="LEAVE">휴학</option>
                    <option value="DROPPED">퇴학</option>
                    <option value="GRADUATED">졸업</option>
                  </select>
                </div>
              </div>
            )}
          </section>

          {/* 우측 */}
          <section className={styles.col}>
            {(form.accountType === "STUDENT" || form.accountType === "PROFESSOR") && (
              <div className={styles.field}>
                <label className={styles.label}>소속 학과</label>
                <select className={styles.select} value={form.deptId} onChange={onChange("deptId")}>
                  <option value={0}>선택</option>
                  {depts.map((d) => (
                    <option key={d.deptId} value={d.deptId}>
                      {d.deptName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {form.accountType === "STUDENT" && (
              <>
                <div className={styles.field}>
                  <label className={styles.label}>주전공</label>
                  <select className={styles.select} value={form.primaryMajorId} onChange={onChange("primaryMajorId")}>
                    <option value={0}>선택</option>
                    {majorsByDept.map((m) => (
                      <option key={m.majorId} value={m.majorId}>
                        {m.majorName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.checkRow}>
                  <input type="checkbox" checked={form.useMinor} onChange={onChange("useMinor")} />
                  <span className={styles.checkText}>부전공(MINOR) 사용</span>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>부전공</label>
                  <select
                    className={styles.select}
                    value={form.minorMajorId}
                    onChange={onChange("minorMajorId")}
                    disabled={!form.useMinor}
                  >
                    <option value={0}>선택</option>
                    {majorsAll.map((m) => (
                      <option key={m.majorId} value={m.majorId}>
                        {m.majorName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.checkRow}>
                  <input type="checkbox" checked={form.useDouble} onChange={onChange("useDouble")} />
                  <span className={styles.checkText}>복수전공(DOUBLE) 사용</span>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>복수전공</label>
                  <select
                    className={styles.select}
                    value={form.doubleMajorId}
                    onChange={onChange("doubleMajorId")}
                    disabled={!form.useDouble}
                  >
                    <option value={0}>선택</option>
                    {majorsAll.map((m) => (
                      <option key={m.majorId} value={m.majorId}>
                        {m.majorName}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {form.accountType === "PROFESSOR" && (
              <div className={styles.noticeBox}>
                <div className={styles.noticeTitle}>안내</div>
                <div className={styles.noticeText}>교수 계정은 소속 학과 및 기본 정보만 수정합니다.</div>
              </div>
            )}

            {form.accountType === "ADMIN" && (
              <div className={styles.field}>
                <label className={styles.label}>메모</label>
                <textarea className={styles.textarea} value={form.memo} onChange={onChange("memo")} placeholder="관리자 메모" />
              </div>
            )}
          </section>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.ghostBtn} onClick={onClose} disabled={saving || loading}>
            취소
          </button>
          <button type="button" className={styles.primaryBtn} onClick={onSubmit} disabled={!canSave}>
            {saving ? "저장 중..." : "계정 수정"}
          </button>
        </div>
      </div>
    </div>
  );
}
