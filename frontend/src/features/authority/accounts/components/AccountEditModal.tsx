"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../styles/AccountModal.module.css";
import type { AccountRowView, AccountStatus, AccountType, StudentEnrollmentStatus } from "../types";
import type { UpdateAccountRequestDto, MajorType } from "../api/dto";
import { accountsApi } from "../api/accountsApi";

export type AccountEditPayload = {
  accountId: number;
  accountType: AccountType;
  body: UpdateAccountRequestDto;
};

type Props = {
  open: boolean;
  row: AccountRowView | null;
  onClose: () => void;
  onSaved: () => void;
};

function pickName(row: AccountRowView) {
  return row.studentProfile?.name ?? row.professorProfile?.name ?? row.adminProfile?.name ?? "";
}
function pickEmail(row: AccountRowView) {
  return row.studentProfile?.email ?? row.professorProfile?.email ?? row.adminProfile?.email ?? "";
}
function pickPhone(row: AccountRowView) {
  return row.studentProfile?.phone ?? row.professorProfile?.phone ?? row.adminProfile?.phone ?? "";
}

export default function AccountEditModal({ open, row, onClose, onSaved }: Props) {
  const account = row?.account;
  const accountType = account?.accountType ?? "STUDENT";

  // 공통(프로필 공통 필드: name/email/phone)
  const [name, setName] = useState("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  // STUDENT
  const [deptId, setDeptId] = useState<number>(1);
  const [studentNo, setStudentNo] = useState<string>("");
  const [gradeLevel, setGradeLevel] = useState<number>(1);
  const [academicStatus, setAcademicStatus] = useState<StudentEnrollmentStatus>("ENROLLED");
  const [primaryMajorId, setPrimaryMajorId] = useState<number>(1);
  const [useMinor, setUseMinor] = useState(false);
  const [minorMajorId, setMinorMajorId] = useState<number>(2);

  // PROFESSOR
  const [professorNo, setProfessorNo] = useState<string>("");

  // ADMIN
  const [memo, setMemo] = useState<string>("");

  useEffect(() => {
    if (!open || !row || !account) return;

    setName(pickName(row));
    setEmail(pickEmail(row) ?? "");
    setPhone(pickPhone(row) ?? "");

    if (account.accountType === "STUDENT") {
      const p = row.studentProfile;
      // 학생프로필 ERD에는 deptId/majors가 없었지만, 요청 규칙에 deptId/majors가 있으므로
      // 목록 응답 profile에 deptId/majors가 포함된다는 전제로, 없으면 기본값 유지
      // (백엔드 응답에 넣어주면 UI가 자동 반영됩니다)
      setDeptId((p as any)?.deptId ?? 1);
      setStudentNo(p?.studentNo ?? "");
      setGradeLevel(p?.gradeLevel ?? 1);
      setAcademicStatus(p?.academicStatus ?? "ENROLLED");

      const majors = ((row as any)?.studentProfile as any)?.majors as
        | Array<{ majorId: number; majorType: MajorType }>
        | undefined;

      const primary = majors?.find((m) => m.majorType === "PRIMARY")?.majorId ?? 1;
      const minor = majors?.find((m) => m.majorType === "MINOR")?.majorId;

      setPrimaryMajorId(primary);
      setUseMinor(typeof minor === "number");
      setMinorMajorId(minor ?? 2);
    }

    if (account.accountType === "PROFESSOR") {
      const p = row.professorProfile as any;
      setDeptId(p?.deptId ?? p?.departmentId ?? 1);
      setProfessorNo(p?.professorNo ?? "");
    }

    if (account.accountType === "ADMIN") {
      const p = row.adminProfile;
      setMemo(p?.memo ?? "");
    }
  }, [open, row, account]);

  const canSubmit = useMemo(() => {
    if (!account) return false;
    if (!name.trim()) return false;

    if (accountType === "STUDENT") return !!studentNo.trim();
    if (accountType === "PROFESSOR") return !!professorNo.trim();
    return true;
  }, [account, accountType, name, studentNo, professorNo]);

  async function resetPassword() {
    if (!account) return;
    try {
      await accountsApi.resetPassword(account.accountId);
      alert("비밀번호 초기화 요청이 완료되었습니다.");
    } catch (e: any) {
      alert(e?.message ?? "비밀번호 초기화 실패");
    }
  }

  async function submit() {
    if (!account) return;

    try {
      if (accountType === "STUDENT") {
        const majors: Array<{ majorId: number; majorType: MajorType }> = [
          { majorId: primaryMajorId, majorType: "PRIMARY" },
        ];
        if (useMinor) majors.push({ majorId: minorMajorId, majorType: "MINOR" });

        const body: UpdateAccountRequestDto = {
          profile: {
            name: name.trim(),
            email: email.trim() ? email.trim() : null,
            phone: phone.trim() ? phone.trim() : null,

            deptId,
            studentNo: studentNo.trim(),
            gradeLevel,
            academicStatus,
            majors,
          },
        };

        await accountsApi.update(account.accountId, body);
      } else if (accountType === "PROFESSOR") {
        const body: UpdateAccountRequestDto = {
          profile: {
            name: name.trim(),
            email: email.trim() ? email.trim() : null,
            phone: phone.trim() ? phone.trim() : null,

            deptId,
            professorNo: professorNo.trim(),
          },
        };

        await accountsApi.update(account.accountId, body);
      } else {
        // 관리자: 기존 adminProfile 유지
        const body: UpdateAccountRequestDto = {
          adminProfile: {
            name: name.trim(),
            email: email.trim() ? email.trim() : null,
            phone: phone.trim() ? phone.trim() : null,
            memo: memo.trim() ? memo.trim() : null,
          },
        };

        await accountsApi.update(account.accountId, body);
      }

      onSaved();
    } catch (e: any) {
      alert(e?.message ?? "수정 실패");
    }
  }

  if (!open || !row || !account) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.title}>계정 수정</div>

        <div className={styles.roleRow}>
          <span className={styles.readonlyRole}>{accountType}</span>
          <span className={styles.readonlyHint}>로그인 아이디 및 유형은 수정할 수 없습니다.</span>
        </div>

        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label}>로그인 아이디</label>
            <input className={styles.input} value={account.loginId} readOnly />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>비밀번호</label>
            <div className={styles.inline}>
              <input className={styles.input} value="********" readOnly />
              <button type="button" className={styles.smallBtn} onClick={resetPassword}>
                초기화
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>이름</label>
            <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>이메일</label>
            <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>전화번호</label>
            <input className={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          {/* 타입별 추가 영역 */}
          {accountType === "STUDENT" && (
            <div className={styles.roleBox}>
              <div className={styles.field}>
                <label className={styles.label}>deptId</label>
                <input
                  className={styles.input}
                  type="number"
                  value={deptId}
                  onChange={(e) => setDeptId(Number(e.target.value))}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>학번(studentNo)</label>
                <input className={styles.input} value={studentNo} onChange={(e) => setStudentNo(e.target.value)} />
              </div>

              <div className={styles.row3}>
                <div className={styles.field}>
                  <label className={styles.label}>학년(gradeLevel)</label>
                  <select
                    className={styles.select}
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field} style={{ gridColumn: "span 2" }}>
                  <label className={styles.label}>재학상태(academicStatus)</label>
                  <select
                    className={styles.select}
                    value={academicStatus}
                    onChange={(e) => setAcademicStatus(e.target.value as StudentEnrollmentStatus)}
                  >
                    <option value="ENROLLED">ENROLLED</option>
                    <option value="LEAVE">LEAVE</option>
                    <option value="DROPPED">DROPPED</option>
                    <option value="GRADUATED">GRADUATED</option>
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>주전공 majorId (PRIMARY)</label>
                <input
                  className={styles.input}
                  type="number"
                  value={primaryMajorId}
                  onChange={(e) => setPrimaryMajorId(Number(e.target.value))}
                />
              </div>

              <div className={styles.field} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  id="useMinorEdit"
                  type="checkbox"
                  checked={useMinor}
                  onChange={(e) => setUseMinor(e.target.checked)}
                />
                <label htmlFor="useMinorEdit" style={{ fontSize: 13 }}>
                  부전공(MINOR) 사용
                </label>
              </div>

              {useMinor && (
                <div className={styles.field}>
                  <label className={styles.label}>부전공 majorId (MINOR)</label>
                  <input
                    className={styles.input}
                    type="number"
                    value={minorMajorId}
                    onChange={(e) => setMinorMajorId(Number(e.target.value))}
                  />
                </div>
              )}
            </div>
          )}

          {accountType === "PROFESSOR" && (
            <div className={styles.roleBox}>
              <div className={styles.field}>
                <label className={styles.label}>deptId</label>
                <input
                  className={styles.input}
                  type="number"
                  value={deptId}
                  onChange={(e) => setDeptId(Number(e.target.value))}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>교번(professorNo)</label>
                <input
                  className={styles.input}
                  value={professorNo}
                  onChange={(e) => setProfessorNo(e.target.value)}
                />
              </div>
            </div>
          )}

          {accountType === "ADMIN" && (
            <div className={styles.roleBox}>
              <div className={styles.field}>
                <label className={styles.label}>메모</label>
                <textarea className={styles.textarea} value={memo} onChange={(e) => setMemo(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.ghostBtn} onClick={onClose}>
            취소
          </button>
          <button type="button" className={styles.primaryBtn} disabled={!canSubmit} onClick={submit}>
            계정 수정
          </button>
        </div>
      </div>
    </div>
  );
}
