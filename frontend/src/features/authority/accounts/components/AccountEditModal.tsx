"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/AccountModal.module.css";
import type { AccountType, MajorType } from "../types";
import { accountsApi } from "../api/accountsApi";
import toast from "react-hot-toast";

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
  studentNo: string;
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
  studentNo: "",

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
  if (!v.trim()) return true;
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(v);
}

function isValidEmail(v: string) {
  if (!v.trim()) return true;
  return v.includes("@");
}

/**
 * ✅ phone은 사용자가 하이픈 없이 입력할 수도 있으니
 * - 01012345678 (숫자 11자리)도 허용
 * - 010-1234-5678 도 허용
 */
function isValidPhone(v: string) {
  if (!v.trim()) return true;
  const t = v.trim();
  return /^\d{3}-\d{4}-\d{4}$/.test(t) || /^\d{11}$/.test(t);
}

/** ✅ API로 보낼 때는 항상 000-0000-0000 형태로 정규화 */
function normalizePhoneForApi(v: string): string | null {
  const t = (v ?? "").trim();
  if (!t) return null;

  // 이미 하이픈 형태
  if (/^\d{3}-\d{4}-\d{4}$/.test(t)) return t;

  // 숫자만 11자리면 하이픈 붙이기
  if (/^\d{11}$/.test(t)) {
    return `${t.slice(0, 3)}-${t.slice(3, 7)}-${t.slice(7)}`;
  }

  // 그 외는 그대로 보내지 말고 null 처리(백엔드 검증 회피)
  return null;
}

function pickMajors(detail: any): Array<{ majorId: number; majorType: MajorType }> {
  const majors = detail?.profile?.majors ?? detail?.studentProfile?.majors ?? [];
  return Array.isArray(majors) ? majors : [];
}

function deriveStudentNoFromLoginId(loginId: string): string {
  const m = String(loginId ?? "").match(/\d{8}$/);
  return m ? m[0] : "";
}

function getDeptIdFromProfile(detail: any, profile: any): number {
  const v =
    profile?.deptId ??
    profile?.departmentId ??
    profile?.dept?.deptId ??
    profile?.dept?.departmentId ??
    profile?.department?.deptId ??
    profile?.department?.departmentId ??
    detail?.deptId ??
    detail?.profile?.deptId ??
    detail?.profile?.departmentId ??
    0;

  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function getStudentNo(detail: any, profile: any): string {
  const v =
    profile?.studentNo ??
    profile?.studentNumber ??
    detail?.studentNo ??
    detail?.profile?.studentNo ??
    detail?.studentProfile?.studentNo ??
    "";
  return String(v ?? "").trim();
}

function makeFormFromDetail(detail: any): FormState {
  const type: AccountType = detail.accountType;
  const status = detail.status as "ACTIVE" | "INACTIVE";

  const profile =
    type === "ADMIN"
      ? (detail.adminProfile ?? detail.profile ?? {})
      : (detail.profile ?? detail.studentProfile ?? detail.professorProfile ?? {});

  const deptId = getDeptIdFromProfile(detail, profile);

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
    next.deptId = deptId;
    next.gradeLevel = Number(profile.gradeLevel ?? 1);
    next.academicStatus = (profile.academicStatus ?? "ENROLLED") as any;
    next.studentNo = getStudentNo(detail, profile);

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
    next.deptId = deptId;
  }

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

  // Profile Image State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isImageDeleting, setIsImageDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [depts, setDepts] = useState<Array<{ deptId: number; deptName: string }>>([]);
  const [majorsByDept, setMajorsByDept] = useState<Array<{ majorId: number; majorName: string }>>([]);
  const [majorsAll, setMajorsAll] = useState<Array<{ majorId: number; majorName: string }>>([]);

  const cleanStrOrNull = (v: string) => {
    const t = (v ?? "").trim();
    return t.length ? t : null;
  };

  const buildStudentMajors = () => {
    const majors: Array<{ majorId: number; majorType: MajorType }> = [];
    if (form.primaryMajorId > 0) majors.push({ majorId: form.primaryMajorId, majorType: "PRIMARY" });
    if (form.useMinor && form.minorMajorId > 0) majors.push({ majorId: form.minorMajorId, majorType: "MINOR" });
    if (form.useDouble && form.doubleMajorId > 0) majors.push({ majorId: form.doubleMajorId, majorType: "DOUBLE" });
    return majors;
  };

  const buildPasswordPart = () => {
    const pw = form.newPassword.trim();
    return pw.length ? { password: pw } : {};
  };

  /** ✅ email/phone 정규화해서 profile에 넣기 */
  const buildBaseProfile = () => ({
    name: form.name.trim(),
    email: cleanStrOrNull(form.email),
    phone: normalizePhoneForApi(form.phone), // ✅ 핵심 수정
  });

  const isHydratingRef = useRef(false);
  const deptChangedByUserRef = useRef(false);

  useEffect(() => {
    if (!open || !accountId) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      isHydratingRef.current = true;
      deptChangedByUserRef.current = false;

      try {
        const deptList = await accountsApi.listDepts();
        setDepts(deptList);

        const detail = await accountsApi.detail(accountId);
        const next = makeFormFromDetail(detail);
        setForm(next);

        // 학생 이미지 조회
        if (next.accountType === "STUDENT") {
          try {
            const imgUrl = await accountsApi.getStudentProfileImage(accountId);
            setImagePreview(imgUrl);
          } catch (e) {
            console.warn("Failed to fetch profile image", e);
          }
        }

        if (next.accountType === "STUDENT" && next.deptId) {
          const majorsDept = await accountsApi.listMajorsByDept(next.deptId).catch(() => []);
          const mapped = majorsDept.map((m: any) => ({ majorId: m.majorId, majorName: m.majorName }));
          setMajorsByDept(mapped);

          if (next.primaryMajorId && !mapped.some((m) => m.majorId === next.primaryMajorId)) {
            setForm((p) => ({ ...p, primaryMajorId: 0 }));
          }
        } else {
          setMajorsByDept([]);
        }

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

  useEffect(() => {
    if (!open) return;
    if (form.accountType !== "STUDENT") return;
    if (isHydratingRef.current) return;

    (async () => {
      if (!form.deptId) {
        setMajorsByDept([]);
        setForm((p) => ({ ...p, primaryMajorId: 0 }));
        deptChangedByUserRef.current = false;
        return;
      }

      const majorsDept = await accountsApi.listMajorsByDept(form.deptId).catch(() => []);
      const mapped = majorsDept.map((m: any) => ({ majorId: m.majorId, majorName: m.majorName }));
      setMajorsByDept(mapped);

      const valid = mapped.some((m) => m.majorId === form.primaryMajorId);

      if (deptChangedByUserRef.current || !valid) {
        setForm((p) => ({ ...p, primaryMajorId: 0 }));
        deptChangedByUserRef.current = false;
      }
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

        const raw = (e.target as HTMLInputElement).value;
        const value = numericKeys.has(key) ? Number(raw) : raw;
        setForm((prev) => ({ ...prev, [key]: value } as FormState));
      };

  const onDeptChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextDeptId = Number(e.target.value);
    deptChangedByUserRef.current = true;

    setForm((p) => ({
      ...p,
      deptId: nextDeptId,
      primaryMajorId: 0,
    }));

    if (!nextDeptId) {
      setMajorsByDept([]);
      return;
    }
    const majorsDept = await accountsApi.listMajorsByDept(nextDeptId).catch(() => []);
    setMajorsByDept(majorsDept.map((m: any) => ({ majorId: m.majorId, majorName: m.majorName })));
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 업로드 직후 바로 반영 (계정 저장과는 별개로 이미지 API 호출 권장)
    if (accountId) {
      accountsApi.updateStudentProfileImage(accountId, file).then(() => {
        toast.success("프로필 이미지가 변경되었습니다.");
      })
        .catch((err) => {
          console.error("Image PATCH failed", err);
          toast.error("이미지 수정 중 오류가 발생했습니다.");
        });
    }
  };

  const onImageDelete = async () => {
    if (!accountId) return;

    setIsImageDeleting(true);
    try {
      await accountsApi.deleteStudentProfileImage(accountId);
      setImagePreview(null);
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("프로필 이미지가 삭제되었습니다.");
    } catch (e) {
      toast.error("이미지 삭제 실패");
    } finally {
      setIsImageDeleting(false);
    }
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

      // studentNo는 DB에 이미 있으므로 "없어도 업데이트 가능"하게 두는 편이 안전함
      // (백엔드가 studentNo를 update에서 금지하는 경우도 있기 때문)
    }

    if (form.accountType === "PROFESSOR") {
      if (!form.deptId) return false;
    }

    return true;
  }, [accountId, saving, loading, form]);

  const onSubmit = async () => {
    if (!accountId || !canSave) return;

    setSaving(true);
    setError(null);

    try {
      // ✅ ADMIN
      if (form.accountType === "ADMIN") {
        const body: any = {
          status: form.status,
          ...buildBaseProfile(),
          memo: cleanStrOrNull(form.memo),
          ...buildPasswordPart(),
        };

        await accountsApi.update(accountId, body);
        await onSaved();
        return;
      }

      // ✅ PROFESSOR
      if (form.accountType === "PROFESSOR") {
        // ✅ profile 대신 professorProfile로 전송 (백엔드 DTO 차이 흡수)
        const body: any = {
          status: form.status,
          ...buildBaseProfile(),
          deptId: form.deptId,
          ...buildPasswordPart(),
        };

        await accountsApi.update(accountId, body);
        await onSaved();
        return;
      }

      // ✅ STUDENT
      const majors = buildStudentMajors();

      // studentNo는 "보내도 되고, 안 보내도 되는" 상태가 가장 안전
      // - backend가 studentNo update를 허용하면 보내도 OK
      // - 금지하면 보내는 순간 실패할 수 있음
      // 그래서: 기존 값이 있으면 보내고, 없으면 loginId에서 파생

      // ✅ profile 대신 studentProfile로 전송 (백엔드 DTO 차이 흡수)
      const body: any = {
        status: form.status,
        ...buildBaseProfile(),
        gradeLevel: Number(form.gradeLevel),
        academicStatus: form.academicStatus,
        deptId: form.deptId,
        majors,

        ...buildPasswordPart(),
      };

      await accountsApi.update(accountId, body);
      await onSaved();
    } catch (e: any) {
      setError(e?.message ?? "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const typeLabel = form.accountType === "STUDENT" ? "학생" : form.accountType === "PROFESSOR" ? "교수" : "관리자";

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
                <div style={{ marginTop: 6, fontSize: 12, color: "#b91c1c" }}>영문/숫자/특수문자 포함 6자 이상</div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>이름</label>
              <input className={styles.input} value={form.name} onChange={onChange("name")} />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>이메일</label>
              <input className={styles.input} value={form.email} onChange={onChange("email")} />
              {!isValidEmail(form.email) && (
                <div style={{ marginTop: 6, fontSize: 12, color: "#b91c1c" }}>@ 포함</div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>연락처</label>
              <input className={styles.input} value={form.phone} onChange={onChange("phone")} />
              {!isValidPhone(form.phone) && (
                <div style={{ marginTop: 6, fontSize: 12, color: "#b91c1c" }}>
                  000-0000-0000 또는 숫자 11자리
                </div>
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
                <select className={styles.select} value={form.deptId} onChange={onDeptChange}>
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
                <textarea
                  className={styles.textarea}
                  value={form.memo}
                  onChange={onChange("memo")}
                  placeholder="관리자 메모"
                />
              </div>
            )}

            {form.accountType === "STUDENT" && (
              <div className={styles.imageSection}>
                <label className={styles.label}>프로필 이미지</label>
                <div className={styles.imageWrapper}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile Preview" className={styles.profileImage} />
                  ) : (
                    <div className={styles.placeholderIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className={styles.imageActions}>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={onImageChange}
                  />
                  <button
                    type="button"
                    className={styles.uploadBtn}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading || saving}
                  >
                    변경
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={onImageDelete}
                      disabled={loading || saving || isImageDeleting}
                    >
                      삭제
                    </button>
                  )}
                </div>
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