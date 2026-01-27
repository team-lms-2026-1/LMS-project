"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/http";
import type { Major } from "@/features/authority/depts/data/DeptMock";
import styles from "@/features/authority/depts/styles/MajorCreateModal.module.css";

/** 전공 생성 요청/응답 타입 (백엔드 DTO에 맞게 필요하면 이름만 수정) */
type CreateMajorRequest = {
  majorName: string;
  majorCode: string;
  description?: string | null;
  active: boolean;
};

type CreateMajorResponse = {
  data: {
    majorId: number;
    majorCode: string;
    majorName: string;
    enrolledStudentCount: number;
  };
  meta: unknown;
};

/** http.ts는 못 건드리니까, 여기서만 쓰는 로컬 POST 함수 */
async function postJsonLocal<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const contentType = res.headers.get("content-type") ?? "";

  // JSON 아니면 텍스트로 읽고 ApiError
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new ApiError(`NON_JSON(${res.status})`, res.status, {
      head: text.slice(0, 300),
      contentType,
    });
  }

  const json = await res.json();

  if (!res.ok) {
    const msg =
      json?.error?.message ||
      json?.message ||
      json?.error ||
      `HTTP_${res.status}`;

    console.error("[postJsonLocal] error body =", json);

    throw new ApiError(msg, res.status, json);
  }

  return json as T;
}

type Props = {
  deptId: string;
  onClose: () => void;
  /** 생성된 전공을 부모(DeptDetailPage)에 알려주는 콜백 */
  onCreated: (major: Major) => void;
};

export default function MajorCreateModal({
  deptId,
  onClose,
  onCreated,
}: Props) {
  const [majorName, setMajorName] = useState("");
  const [majorCode, setMajorCode] = useState("");
  const [active, setActive] = useState(false);
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MajorCreateModal.tsx 안, form 제출 함수 예시
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // 예: 상태값들
  // const [majorCode, setMajorCode] = useState("");
  // const [majorName, setMajorName] = useState("");
  // const [description, setDescription] = useState("");
  // const [active, setActive] = useState(true);

  // 검증
  if (!majorCode.trim() || !majorName.trim()) {
    setError("전공 코드와 전공명을 모두 입력해 주세요.");
    return;
  }

  setSubmitting(true);
  setError(null);

  try {
    const res = await fetch(`/api/bff/admin/depts/${deptId}/majors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        majorCode: majorCode.trim(),
        majorName: majorName.trim(),
        description: description.trim() || null,
        active,
      }),
    });

    const body = await res.json();
    console.log("[MajorCreateModal] POST /majors status:", res.status, "body:", body);

    if (!res.ok) {
      const msg =
        body?.message ||
        body?.error ||
        "전공 생성 중 오류가 발생했습니다.";
      setError(msg);
      return;
    }

    // 🔥 여기! 백엔드 응답을 굳이 의존하지 말고,
    //      폼에 입력한 값으로 화면용 Major 객체를 만든다.
    const createdMajor: Major = {
      // id는 백엔드에서 내려주면 쓰고, 없으면 임시값
      id: String(
        body?.data?.majorId ??
          body?.data?.id ??
          body?.majorId ??
          body?.id ??
          `temp-${Date.now()}`
      ),
      code:
        body?.data?.majorCode ??
        body?.data?.code ??
        body?.majorCode ??
        body?.code ??
        majorCode.trim(),    // <- 최소한 폼 값은 들어가도록
      name:
        body?.data?.majorName ??
        body?.data?.name ??
        body?.majorName ??
        body?.name ??
        majorName.trim(),    // <- 최소한 폼 값은 들어가도록
      studentCount:
        body?.data?.enrolledStudentCount ??
        body?.data?.studentCount ??
        body?.enrolledStudentCount ??
        body?.studentCount ??
        0,
    };

    console.log("[MajorCreateModal] createdMajor for UI:", createdMajor);

    // ✅ DeptDetailPage로 "완성된 Major"를 넘긴다
    onCreated(createdMajor);

    // 모달 닫기
    onClose();
  } catch (err) {
    console.error("[MajorCreateModal] POST error:", err);
    setError("전공 생성 중 오류가 발생했습니다.");
  } finally {
    setSubmitting(false);
  }
};


  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>전공 추가</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>전공이름</label>
            <input
              className={styles.input}
              value={majorName}
              onChange={(e) => setMajorName(e.target.value)}
              placeholder="예: 소프트웨어공학"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>전공코드</label>
            <input
              className={styles.input}
              value={majorCode}
              onChange={(e) => setMajorCode(e.target.value)}
              placeholder="예: CS_SW"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>사용 여부</label>
            <button
              type="button"
              className={
                active
                  ? `${styles.toggle} ${styles.toggleOn}`
                  : `${styles.toggle} ${styles.toggleOff}`
              }
              onClick={() => setActive((v) => !v)}
            >
              {active ? "사용" : "비활성화"}
            </button>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>설명</label>
            <textarea
              className={styles.textarea}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="전공에 대한 설명을 입력하세요."
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={submitting}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? "생성 중..." : "전공 생성"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
