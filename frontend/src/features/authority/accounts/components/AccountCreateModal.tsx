"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../styles/AccountModal.module.css";
import { AccountStatus, AccountType, StudentEnrollmentStatus } from "../types";
import { accountsApi } from "../api/accountsApi";
import type { MajorType } from "../api/dto";

/**
 * NOTE
 * - 학생/교수: 요청 JSON 규칙대로 payload 구성
 * - 관리자: 기존 adminProfile 방식 유지
 *
 * deptId / majorId는 “숫자”이므로, 지금은 입력/선택값을 number로 관리합니다.
 * (학과/전공 lookup이 이미 있다면 select로 바꿔도 payload는 동일)
 */

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function AccountCreateModal({ open, onClose, onCreated }: Props) {
  const [type, setType] = useState<AccountType>("STUDENT");

  // 공통(학생/교수/관리자 모두 사용)
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<AccountStatus>("ACTIVE");

  // 공통 프로필 필드(학생/교수)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // STUDENT 전용
  const [deptId, setDeptId] = useState<number>(1);
  const [studentNo, setStudentNo] = useState("");
  const [gradeLevel, setGradeLevel] = useState<number>(1);
  const [academicStatus, setAcademicStatus] = useState<StudentEnrollmentStatus>("ENROLLED");

  // majors: PRIMARY 1개 + MINOR(옵션) 1개 형태로 UI 구성(요구 규칙에 맞춰 단순화)
  const [primaryMajorId, setPrimaryMajorId] = useState<number>(1);
  const [useMinor, setUseMinor] = useState(false);
  const [minorMajorId, setMinorMajorId] = useState<number>(2);

  // PROFESSOR 전용
  const [professorNo, setProfessorNo] = useState("");

  // ADMIN(기존 유지)
  const [adminMemo, setAdminMemo] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    if (!open) return;

    setType("STUDENT");
    setLoginId("");
    setPassword("");
    setStatus("ACTIVE");

    setName("");
    setEmail("");
    setPhone("");

    setDeptId(1);
    setStudentNo("");
    setGradeLevel(1);
    setAcademicStatus("ENROLLED");

    setPrimaryMajorId(1);
    setUseMinor(false);
    setMinorMajorId(2);

    setProfessorNo("");

    setAdminName("");
    setAdminEmail("");
    setAdminPhone("");
    setAdminMemo("");
  }, [open]);

  const majorsPayload = useMemo(() => {
    const majors: Array<{ majorId: number; majorType: MajorType }> = [
      { majorId: primaryMajorId, majorType: "PRIMARY" },
    ];
    if (useMinor) majors.push({ majorId: minorMajorId, majorType: "MINOR" });
    return majors;
  }, [primaryMajorId, useMinor, minorMajorId]);

  const canSubmitCommon = loginId.trim() && password.trim();

  const canSubmit =
    canSubmitCommon &&
    (type === "ADMIN"
      ? adminName.trim()
      : name.trim() && (type === "PROFESSOR" ? professorNo.trim() : studentNo.trim()));

  async function submit() {
    try {
      if (type === "STUDENT") {
        await accountsApi.create({
          loginId: loginId.trim(),
          password,
          accountType: "STUDENT",
          status,
          profile: {
            name: name.trim(),
            email: email.trim() ? email.trim() : null,
            phone: phone.trim() ? phone.trim() : null,

            deptId,

            studentNo: studentNo.trim(),
            gradeLevel,
            academicStatus,

            majors: majorsPayload,
          },
        });
      } else if (type === "PROFESSOR") {
        await accountsApi.create({
          loginId: loginId.trim(),
          password,
          accountType: "PROFESSOR",
          status,
          profile: {
            name: name.trim(),
            email: email.trim() ? email.trim() : null,
            phone: phone.trim() ? phone.trim() : null,

            deptId,
            professorNo: professorNo.trim(),
          },
        });
      } else {
        // ✅ 관리자: 기존 규칙 유지
        await accountsApi.create({
          loginId: loginId.trim(),
          password,
          accountType: "ADMIN",
          status,
          adminProfile: {
            name: adminName.trim(),
            email: adminEmail.trim() ? adminEmail.trim() : null,
            phone: adminPhone.trim() ? adminPhone.trim() : null,
            memo: adminMemo.trim() ? adminMemo.trim() : null,
          },
        });
      }

      onCreated();
    } catch (e: any) {
      alert(e?.message ?? "생성 실패");
    }
  }

  if (!open) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.title}>계정 생성</div>

        <div className={styles.roleRow}>
          <label className={styles.radio}>
            <input type="radio" checked={type === "STUDENT"} onChange={() => setType("STUDENT")} />
            학생
          </label>
          <label className={styles.radio}>
            <input
              type="radio"
              checked={type === "PROFESSOR"}
              onChange={() => setType("PROFESSOR")}
            />
            교수
          </label>
          <label className={styles.radio}>
            <input type="radio" checked={type === "ADMIN"} onChange={() => setType("ADMIN")} />
            관리자
          </label>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>상태</span>
            <select
              className={styles.select}
              value={status}
              onChange={(e) => setStatus(e.target.value as AccountStatus)}
              style={{ width: 140 }}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>

        <div className={styles.grid}>
          {/* 공통(계정) */}
          <div className={styles.field}>
            <label className={styles.label}>로그인 아이디</label>
            <input className={styles.input} value={loginId} onChange={(e) => setLoginId(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>비밀번호</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="초기 비밀번호"
            />
          </div>

          {/* 학생/교수 공통 프로필 */}
          {(type === "STUDENT" || type === "PROFESSOR") && (
            <>
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

              <div className={styles.field}>
                <label className={styles.label}>deptId</label>
                <input
                  className={styles.input}
                  type="number"
                  value={deptId}
                  onChange={(e) => setDeptId(Number(e.target.value))}
                />
              </div>
            </>
          )}

          {/* STUDENT 규칙 필드 */}
          {type === "STUDENT" && (
            <div className={styles.roleBox}>
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
                <label className={styles.label}>주전공(majors[PRIMARY]) majorId</label>
                <input
                  className={styles.input}
                  type="number"
                  value={primaryMajorId}
                  onChange={(e) => setPrimaryMajorId(Number(e.target.value))}
                />
              </div>

              <div className={styles.field} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  id="useMinor"
                  type="checkbox"
                  checked={useMinor}
                  onChange={(e) => setUseMinor(e.target.checked)}
                />
                <label htmlFor="useMinor" style={{ fontSize: 13 }}>
                  부전공(MINOR) 사용
                </label>
              </div>

              {useMinor && (
                <div className={styles.field}>
                  <label className={styles.label}>부전공(majors[MINOR]) majorId</label>
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

          {/* PROFESSOR 규칙 필드 */}
          {type === "PROFESSOR" && (
            <div className={styles.roleBox}>
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

          {/* ADMIN 기존 유지 */}
          {type === "ADMIN" && (
            <div className={styles.roleBox}>
              <div className={styles.field}>
                <label className={styles.label}>이름</label>
                <input className={styles.input} value={adminName} onChange={(e) => setAdminName(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>이메일</label>
                <input className={styles.input} value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>전화번호</label>
                <input className={styles.input} value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>메모</label>
                <textarea className={styles.textarea} value={adminMemo} onChange={(e) => setAdminMemo(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.ghostBtn} onClick={onClose}>
            취소
          </button>
          <button type="button" className={styles.primaryBtn} disabled={!canSubmit} onClick={submit}>
            계정 생성
          </button>
        </div>
      </div>
    </div>
  );
}
