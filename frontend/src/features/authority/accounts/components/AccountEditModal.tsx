"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/AccountModal.module.css";
import type { AccountType, MajorType } from "../types";
import { accountsApi } from "../api/accountsApi";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

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
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(v);
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
  const t = useI18n("authority.accounts.modals.edit");
  const tRoles = useI18n("authority.accounts.common.roles");
  const tStatus = useI18n("authority.accounts.common.status");
  const tAcademicStatus = useI18n("authority.accounts.common.academicStatus");
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
        setError(e?.message ?? t("messages.detailLoadFailed"));
        setForm(emptyForm);
        setMajorsByDept([]);
        setMajorsAll([]);
      } finally {
        isHydratingRef.current = false;
        setLoading(false);
      }
    };

    load();
  }, [open, accountId, t]);

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
        toast.success(t("toasts.imageUpdated"));
      })
        .catch((err) => {
          console.error("Image PATCH failed", err);
          toast.error(t("toasts.imageUpdateFailed"));
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
      toast.success(t("toasts.imageDeleted"));
    } catch (e) {
      toast.error(t("toasts.imageDeleteFailed"));
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
      setError(e?.message ?? t("messages.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const typeLabel = tRoles(form.accountType);

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{t("title")}</h2>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.headerLabel}>{t("header.type")}</span>
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
              {tRoles(t)}
            </button>
          ))}
        </div>

        {error && <div style={{ marginBottom: 12, color: "#b91c1c", fontSize: 13 }}>{error}</div>}
        {loading ? <div style={{ padding: 12 }}>{t("loading")}</div> : null}

        <div className={styles.grid}>
          {/* 좌측 */}
          <section className={styles.col}>
            <div className={styles.field}>
              <label className={styles.label}>{t("fields.loginId")}</label>
              <input className={styles.input} value={form.loginId} disabled />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t("fields.currentPassword")}</label>
              <div className={styles.inlineRow}>
                <input className={styles.input} value={"********"} disabled />
              </div>
              <div className={styles.idHint}>{t("hints.currentPasswordMasked")}</div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t("fields.newPassword")}</label>
              <input
                className={styles.input}
                value={form.newPassword}
                type="password"
                onChange={onChange("newPassword")}
                placeholder={t("placeholders.newPassword")}
              />
              {!isValidPassword(form.newPassword) && (
                <div style={{ marginTop: 6, fontSize: 12, color: "#b91c1c" }}>{t("validation.password")}</div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t("fields.name")}</label>
              <input className={styles.input} value={form.name} onChange={onChange("name")} />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t("fields.email")}</label>
              <input className={styles.input} value={form.email} onChange={onChange("email")} />
              {!isValidEmail(form.email) && (
                <div style={{ marginTop: 6, fontSize: 12, color: "#b91c1c" }}>{t("validation.email")}</div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t("fields.phone")}</label>
              <input className={styles.input} value={form.phone} onChange={onChange("phone")} />
              {!isValidPhone(form.phone) && (
                <div style={{ marginTop: 6, fontSize: 12, color: "#b91c1c" }}>
                  {t("validation.phone")}
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t("fields.status")}</label>
              <select className={styles.select} value={form.status} onChange={onChange("status")}>
                <option value="ACTIVE">{tStatus("ACTIVE")}</option>
                <option value="INACTIVE">{tStatus("INACTIVE")}</option>
              </select>
            </div>

            {form.accountType === "STUDENT" && (
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>{t("fields.gradeLevel")}</label>
                  <select className={styles.select} value={form.gradeLevel} onChange={onChange("gradeLevel")}>
                    {[1, 2, 3, 4].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>{t("fields.academicStatus")}</label>
                  <select className={styles.select} value={form.academicStatus} onChange={onChange("academicStatus")}>
                    <option value="ENROLLED">{tAcademicStatus("ENROLLED")}</option>
                    <option value="LEAVE">{tAcademicStatus("LEAVE")}</option>
                    <option value="DROPPED">{tAcademicStatus("DROPPED")}</option>
                    <option value="GRADUATED">{tAcademicStatus("GRADUATED")}</option>
                  </select>
                </div>
              </div>
            )}
          </section>

          {/* 우측 */}
          <section className={styles.col}>
            {(form.accountType === "STUDENT" || form.accountType === "PROFESSOR") && (
              <div className={styles.field}>
                <label className={styles.label}>{t("fields.department")}</label>
                <select className={styles.select} value={form.deptId} onChange={onDeptChange}>
                  <option value={0}>{t("select.select")}</option>
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
                  <label className={styles.label}>{t("fields.primaryMajor")}</label>
                  <select className={styles.select} value={form.primaryMajorId} onChange={onChange("primaryMajorId")}>
                    <option value={0}>{t("select.select")}</option>
                    {majorsByDept.map((m) => (
                      <option key={m.majorId} value={m.majorId}>
                        {m.majorName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.checkRow}>
                  <input type="checkbox" checked={form.useMinor} onChange={onChange("useMinor")} />
                  <span className={styles.checkText}>{t("toggles.useMinor")}</span>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{t("fields.minorMajor")}</label>
                  <select
                    className={styles.select}
                    value={form.minorMajorId}
                    onChange={onChange("minorMajorId")}
                    disabled={!form.useMinor}
                  >
                    <option value={0}>{t("select.select")}</option>
                    {majorsAll.map((m) => (
                      <option key={m.majorId} value={m.majorId}>
                        {m.majorName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.checkRow}>
                  <input type="checkbox" checked={form.useDouble} onChange={onChange("useDouble")} />
                  <span className={styles.checkText}>{t("toggles.useDouble")}</span>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{t("fields.doubleMajor")}</label>
                  <select
                    className={styles.select}
                    value={form.doubleMajorId}
                    onChange={onChange("doubleMajorId")}
                    disabled={!form.useDouble}
                  >
                    <option value={0}>{t("select.select")}</option>
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
                <div className={styles.noticeTitle}>{t("notices.professor.title")}</div>
                <div className={styles.noticeText}>{t("notices.professor.text")}</div>
              </div>
            )}

            {form.accountType === "ADMIN" && (
              <div className={styles.field}>
                <label className={styles.label}>{t("fields.memo")}</label>
                <textarea
                  className={styles.textarea}
                  value={form.memo}
                  onChange={onChange("memo")}
                  placeholder={t("placeholders.memo")}
                />
              </div>
            )}

            {form.accountType === "STUDENT" && (
              <div className={styles.imageSection}>
                <label className={styles.label}>{t("fields.profileImage")}</label>
                <div className={styles.imageWrapper}>
                  {imagePreview ? (
                    <img src={imagePreview} alt={t("alts.profileImage")} className={styles.profileImage} />
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
                    {t("buttons.changeImage")}
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={onImageDelete}
                      disabled={loading || saving || isImageDeleting}
                    >
                      {t("buttons.deleteImage")}
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.ghostBtn} onClick={onClose} disabled={saving || loading}>
            {t("buttons.cancel")}
          </button>
          <button type="button" className={styles.primaryBtn} onClick={onSubmit} disabled={!canSave}>
            {saving ? t("buttons.saving") : t("buttons.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
