"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./QnaCreatePage.module.css";
import type { Category, CreateQnaQuestionRequestDto } from "../../api/types";
import { createQnaQuestion, fetchQnaCategories } from "../../api/QnasApi";

const LIST_PATH = "/student/community/qna/questions"; // ✅ 너 프로젝트 목록 라우트에 맞춰 수정 가능

export default function QnaCreatePageClient() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // ✅ 카테고리
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>(""); // select는 string
  const [loadingCats, setLoadingCats] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  // ✅ 카테고리 목록 로드
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingCats(true);
      try {
        const res = await fetchQnaCategories();

        // 응답이 {data: [...]} 형태 (너의 ApiResponse)
        const list = Array.isArray(res?.data) ? res.data : [];
        if (!alive) return;

        setCategories(list);

        // 기본 선택값: 첫 카테고리(원하면 미분류 유지)
        // 미분류를 default로 두고 싶으면 아래 줄 주석 처리
        if (!categoryId && list.length > 0) setCategoryId(String(list[0].categoryId));
      } catch (e) {
        // 카테고리 불러오기 실패해도 등록 자체는 되게(미분류)
        if (!alive) return;
        setCategories([]);
      } finally {
        if (alive) setLoadingCats(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && content.trim().length > 0 && !saving;
  }, [title, content, saving]);

  const onSubmit = async () => {
    setError("");

    const t = title.trim();
    const c = content.trim();
    if (!t) return setError("제목을 입력하세요.");
    if (!c) return setError("내용을 입력하세요.");

    const body: CreateQnaQuestionRequestDto = {
      title: t,
      content: c,
      categoryId: categoryId ? Number(categoryId) : null,
    };

    setSaving(true);
    try {
      await createQnaQuestion(body);
      router.push(LIST_PATH);
    } catch (e: any) {
      setError(e?.message ?? "등록에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Q&A 질문 등록</h1>

          <button
            type="button"
            className={styles.backBtn}
            onClick={() => router.push(LIST_PATH)}
            disabled={saving}
          >
            목록으로
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.form}>
          <div className={styles.field}>
            <div className={styles.label}>분류</div>
            <select
              className={styles.select}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={saving || loadingCats}
            >
              <option value="">{loadingCats ? "불러오는 중..." : "미분류"}</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={String(c.categoryId)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>제목</div>
            <input
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              disabled={saving}
              maxLength={190}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.label}>내용</div>
            <textarea
              className={styles.textarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="질문 내용을 입력하세요"
              disabled={saving}
              rows={12}
            />
          </div>

          <div className={styles.footerRow}>
            <button
              type="button"
              className={styles.submitBtn}
              onClick={onSubmit}
              disabled={!canSubmit}
            >
              {saving ? "등록 중..." : "등록"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
