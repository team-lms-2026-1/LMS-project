"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "../styles/AccountModal.module.css";
import { accountsApi } from "../api/accountsApi";
import type { AccountType, MajorType } from "../types";

type RoleTab = "STUDENT" | "PROFESSOR" | "ADMIN";

const PREFIX_MAP: Record<RoleTab, string> = {
  STUDENT: "s",
  PROFESSOR: "p",
  ADMIN: "a",
};

function isEightDigits(v: string) {
  return /^\d{8}$/.test(v);
}

function isValidPassword(v: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(v);
}

function isValidEmail(v: string) {
  if (!v.trim()) return true;
  return v.includes("@");
}

function formatPhone(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function isValidPhone(v: string) {
  if (!v.trim()) return true;
  return /^\d{3}-\d{4}-\d{4}$/.test(v);
}

export default function AccountCreateModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [tab, setTab] = useState<RoleTab>("STUDENT");

  // ✅ ID는 숫자 8자리만
  const [loginIdDigits, setLoginIdDigits] = useState("");

  const [form, setForm] = useState({
    password: "",
    name: "",
    email: "",
    phone: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",

    // STUDENT/PROFESSOR
    deptId: 0,

    // STUDENT
    primaryMajorId: 0,
    useMinor: false,
    minorMajorId: 0,
    useDouble: false,
    doubleMajorId: 0,

    gradeLevel: 1,
    academicStatus: "ENROLLED" as "ENROLLED" | "LEAVE" | "DROPPED" | "GRADUATED",

    // ADMIN
    memo: "",
  });

  const [depts, setDepts] = useState<Array<{ deptId: number; deptName: string }>>([]);
  const [majorsByDept, setMajorsByDept] = useState<Array<{ majorId: number; majorName: string; deptId?: number }>>(
    []
  );
  const [majorsAll, setMajorsAll] = useState<Array<{ majorId: number; majorName: string; deptId?: number }>>([]);

  const [deptLoading, setDeptLoading] = useState(false);
  const [majorDeptLoading, setMajorDeptLoading] = useState(false);
  const [majorAllLoading, setMajorAllLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const idPrefix = PREFIX_MAP[tab];
  const fullLoginId = useMemo(() => {
    if (!isEightDigits(loginIdDigits)) return "";
    return `${idPrefix}${loginIdDigits}`;
  }, [idPrefix, loginIdDigits]);

  const idError = loginIdDigits.length > 0 && !isEightDigits(loginIdDigits);
  const pwError = form.password.length > 0 && !isValidPassword(form.password);

  const onChange =
    (key: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const t = e.target as HTMLInputElement;
        const value =
          t.type === "checkbox" ? t.checked : t.type === "number" ? Number(t.value) : t.value;
        setForm((prev) => ({ ...prev, [key]: value }));
      };

  const onChangePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, phone: formatPhone(e.target.value) }));
  };

  // ✅ ID 숫자만 입력 + 8자리 제한
  const onChangeLoginDigits = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 8);
    setLoginIdDigits(onlyDigits);
  };

  // ✅ 모달 열릴 때 초기화
  useEffect(() => {
    if (!open) return;

    setTab("STUDENT");
    setLoginIdDigits("");
    setForm({
      password: "",
      name: "",
      email: "",
      phone: "",
      status: "ACTIVE",
      deptId: 0,
      primaryMajorId: 0,
      useMinor: false,
      minorMajorId: 0,
      useDouble: false,
      doubleMajorId: 0,
      gradeLevel: 1,
      academicStatus: "ENROLLED",
      memo: "",
    });
    setMajorsByDept([]);
    setImageFile(null);
    setImagePreview(null);
  }, [open]);

  // ✅ 학과 목록 로드
  useEffect(() => {
    if (!open) return;
    (async () => {
      setDeptLoading(true);
      try {
        const list = await accountsApi.listDepts();
        setDepts(list);
      } finally {
        setDeptLoading(false);
      }
    })();
  }, [open]);

  // ✅ 전체 전공 로드 (부/복수전공용: 학과 무관)
  useEffect(() => {
    if (!open) return;
    (async () => {
      setMajorAllLoading(true);
      try {
        const list = await accountsApi.listMajorsAll();
        setMajorsAll(list);
      } catch {
        setMajorsAll([]);
      } finally {
        setMajorAllLoading(false);
      }
    })();
  }, [open]);

  // ✅ 학과 선택 시: 주전공 전공 로드 (학생 탭에서만 의미 있지만 공용으로 준비)
  useEffect(() => {
    if (!open) return;

    if (!form.deptId) {
      setMajorsByDept([]);
      setForm((p) => ({ ...p, primaryMajorId: 0 }));
      return;
    }

    (async () => {
      setMajorDeptLoading(true);
      try {
        const list = await accountsApi.listMajorsByDept(form.deptId);
        setMajorsByDept(list);
        setForm((p) => ({ ...p, primaryMajorId: 0 }));
      } finally {
        setMajorDeptLoading(false);
      }
    })();
  }, [open, form.deptId]);

  const emailOk = isValidEmail(form.email);
  const phoneOk = isValidPhone(form.phone);

  const canSubmit = useMemo(() => {
    if (saving) return false;
    if (!fullLoginId) return false;
    if (!isValidPassword(form.password)) return false;
    if (!form.name.trim()) return false;
    if (!emailOk || !phoneOk) return false;

    if (tab === "STUDENT") {
      if (!form.deptId) return false;
      if (!form.primaryMajorId) return false;
      if (form.useMinor && !form.minorMajorId) return false;
      if (form.useDouble && !form.doubleMajorId) return false;
      return true;
    }

    if (tab === "PROFESSOR") {
      // 교수: 전공 없음, 학과만
      if (!form.deptId) return false;
      return true;
    }

    // ADMIN: 학과/전공 없음, memo 선택
    return true;
  }, [saving, fullLoginId, form, emailOk, phoneOk, tab]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async () => {
    if (!canSubmit) return;

    setSaving(true);
    try {
      const accountType: AccountType = tab;

      if (tab === "STUDENT") {
        const majors: Array<{ majorId: number; majorType: MajorType }> = [
          { majorId: form.primaryMajorId, majorType: "PRIMARY" },
          ...(form.useMinor ? [{ majorId: form.minorMajorId, majorType: "MINOR" as const }] : []),
          ...(form.useDouble ? [{ majorId: form.doubleMajorId, majorType: "DOUBLE" as const }] : []),
        ];

        const payload: any = {
          loginId: fullLoginId,
          password: form.password,
          accountType,
          status: form.status,
          profile: {
            name: form.name,
            email: form.email || null,
            phone: form.phone || null,
            deptId: form.deptId,

            studentNo: loginIdDigits, // ✅ 학번 = 숫자 8자리
            gradeLevel: form.gradeLevel,
            academicStatus: form.academicStatus,

            majors,
          },
        };

        await accountsApi.create(payload);

        if (imageFile) {
          try {
            // ✅ 백엔드 keyword 검색이 loginId를 지원하지 않으므로, 최근 생성된 목록에서 직접 찾음
            const listRes = await accountsApi.list({ accountType: "STUDENT", size: 50 });
            const found = listRes.items.find((it) => it.loginId === fullLoginId);

            if (found?.accountId) {
              await accountsApi.uploadStudentProfileImage(found.accountId, imageFile);
            }
          } catch (e) {
            console.error("Image upload failed:", e);
            alert("계정은 생성되었으나 프로필 이미지 업로드에 실패했습니다.");
          }
        }

        await onCreated();
        return;
      }

      if (tab === "PROFESSOR") {
        const payload: any = {
          loginId: fullLoginId,
          password: form.password,
          accountType,
          status: form.status,
          profile: {
            name: form.name,
            email: form.email || null,
            phone: form.phone || null,
            deptId: form.deptId,
            // professorNo는 백엔드 정책에 따라 입력/자동 생성. 지금 프로젝트 dto가 professorNo 필요로 되어 있어 digits를 사용.
            professorNo: loginIdDigits,
          },
        };

        await accountsApi.create(payload);
        await onCreated();
        return;
      }

      // ADMIN (기존 DTO 유지: adminProfile)
      const payload: any = {
        loginId: fullLoginId,
        password: form.password,
        accountType,
        status: form.status,
        adminProfile: {
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          memo: form.memo || null,
        },
      };

      await accountsApi.create(payload);
      await onCreated();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>계정 생성</div>
            <div className={styles.tabRow}>
              {(["STUDENT", "PROFESSOR", "ADMIN"] as RoleTab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.tabBtn} ${tab === t ? styles.tabActive : ""}`}
                  onClick={() => setTab(t)}
                >
                  {t === "STUDENT" ? "학생" : t === "PROFESSOR" ? "교수" : "관리자"}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.headerLabel}>상태</div>
            <select className={styles.select} value={form.status} onChange={onChange("status")}>
              <option value="ACTIVE">활성</option>
              <option value="INACTIVE">비활성</option>
            </select>
          </div>
        </div>

        <div className={styles.grid}>
          {/* 좌 */}
          <section className={styles.col}>
            <div className={styles.field}>
              <label className={styles.label}>로그인 ID</label>

              <div className={styles.idRow}>
                <div className={styles.idPrefix}>{idPrefix}</div>
                <input
                  className={styles.input}
                  value={loginIdDigits}
                  onChange={onChangeLoginDigits}
                  inputMode="numeric"
                  placeholder="숫자 8자리 입력"
                />
              </div>

              <div className={styles.idHint}>예: {idPrefix}12345678 (앞의 문자는 자동 적용)</div>

              {idError && (
                <div style={{ marginTop: 6, fontSize: 12, color: "#b91c1c" }}>
                  ID는 숫자 8자리여야 합니다.
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>비밀번호</label>
              <input
                className={styles.input}
                type="password"
                value={form.password}
                onChange={onChange("password")}
                placeholder="영문 대/소문자+숫자 포함, 6자리 이상"
              />
              {pwError && (
                <div style={{ marginTop: 6, fontSize: 12, color: "#b91c1c" }}>
                  비밀번호 조건을 만족해야 합니다.
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>이름</label>
              <input className={styles.input} value={form.name} onChange={onChange("name")} placeholder="이름 입력" />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>이메일</label>
              <input className={styles.input} value={form.email} onChange={onChange("email")} placeholder="example@email.com" />
              {!emailOk && <div style={{ marginTop: 6, fontSize: 12, color: "#b91c1c" }}>@ 포함 필수</div>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>연락처</label>
              <input className={styles.input} value={form.phone} onChange={onChangePhone} placeholder="010-0000-0000" />
              {!phoneOk && <div style={{ marginTop: 6, fontSize: 12, color: "#b91c1c" }}>000-0000-0000 형식</div>}
            </div>

            {tab === "STUDENT" && (
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

            {tab === "ADMIN" && (
              <div className={styles.field}>
                <label className={styles.label}>메모</label>
                <textarea
                  className={styles.textarea}
                  value={form.memo}
                  onChange={onChange("memo")}
                  placeholder="관리자 메모를 입력하세요."
                />
              </div>
            )}
          </section>

          {/* 우 */}
          <section className={styles.col}>
            {tab === "STUDENT" && (
              <div className={styles.imageSection}>
                <label className={styles.label}>프로필 이미지</label>
                <div className={styles.imageWrapper}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className={styles.profileImage} />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className={styles.placeholderIcon}
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className={styles.imageActions}>
                  <label className={styles.uploadBtn}>
                    {imagePreview ? "변경" : "이미지 선택"}
                    <input type="file" accept="image/*" hidden onChange={onFileChange} disabled={saving} />
                  </label>
                  {imagePreview && (
                    <button type="button" className={styles.deleteBtn} onClick={onRemoveImage} disabled={saving}>
                      삭제
                    </button>
                  )}
                </div>
              </div>
            )}

            {(tab === "STUDENT" || tab === "PROFESSOR") && (
              <div className={styles.field}>
                <label className={styles.label}>소속 학과</label>
                <select className={styles.select} value={form.deptId} onChange={onChange("deptId")}>
                  <option value={0}>{deptLoading ? "불러오는 중..." : "선택"}</option>
                  {depts.map((d) => (
                    <option key={d.deptId} value={d.deptId}>
                      {d.deptName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 교수: 전공 섹션 제거 */}
            {tab === "PROFESSOR" && (
              <div className={styles.noticeBox}>
                <div className={styles.noticeTitle}>안내</div>
                <div className={styles.noticeText}>
                  교수 계정은 소속 학과 및 기본 정보(이름/이메일/연락처)만 입력합니다.
                </div>
              </div>
            )}

            {tab === "STUDENT" && (
              <>
                <div className={styles.field}>
                  <label className={styles.label}>주전공</label>
                  <select
                    className={styles.select}
                    value={form.primaryMajorId}
                    onChange={onChange("primaryMajorId")}
                    disabled={!form.deptId || majorDeptLoading}
                  >
                    <option value={0}>{majorDeptLoading ? "불러오는 중..." : "선택"}</option>
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
                    disabled={!form.useMinor || majorAllLoading}
                  >
                    <option value={0}>{majorAllLoading ? "불러오는 중..." : "선택하세요..."}</option>
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
                    disabled={!form.useDouble || majorAllLoading}
                  >
                    <option value={0}>{majorAllLoading ? "불러오는 중..." : "선택"}</option>
                    {majorsAll.map((m) => (
                      <option key={m.majorId} value={m.majorId}>
                        {m.majorName}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {tab === "ADMIN" && (
              <div className={styles.noticeBox}>
                <div className={styles.noticeTitle}>안내</div>
                <div className={styles.noticeText}>관리자 계정은 학과/전공 정보를 사용하지 않습니다.</div>
              </div>
            )}
          </section>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.ghostBtn} onClick={onClose} disabled={saving}>
            취소
          </button>
          <button type="button" className={styles.primaryBtn} onClick={onSubmit} disabled={!canSubmit}>
            {saving ? "생성 중..." : "계정 생성"}
          </button>
        </div>
      </div>
    </div>
  );
}
