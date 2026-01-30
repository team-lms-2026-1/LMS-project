"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./FaqEditPage.module.css";
import type { Category, FaqListItemDto, UpdateFaqRequestDto } from "../../api/types";
import { fetchFaqCategories, fetchFaqDetail, updateFaq } from "../../api/FaqsApi";
import { Button } from "@/components/button";

type LoadState =
  | { loading: true; error: string | null; data: null }
  | { loading: false; error: string | null; data: FaqListItemDto | null };

function normalizeDetail(payload: any): FaqListItemDto {
  const raw = payload?.data ?? payload;
  const created = raw?.createAt ?? raw?.createdAt ?? raw?.cerateAt ?? raw?.create_at ?? "";

  return {
    faqId: Number(raw?.faqId ?? 0),
    category: raw?.category,
    title: String(raw?.title ?? ""),
    content: String(raw?.content ?? ""),
    authorName: String(raw?.authorName ?? ""),
    viewCount: Number(raw?.viewCount ?? 0),
    createdAt: String(created),
    status: String(raw?.status ?? ""),
  };
}

export default function FaqEditPageClient() {
  const router = useRouter();
  const params = useParams<{ faqId?: string }>();
  const faqId = useMemo(() => Number(params?.faqId ?? 0), [params]);

  const LIST_PATH = "/admin/community/faqs";
  const DETAIL_PATH = `/admin/community/faqs/${faqId}`;

  const [load, setLoad] = useState<LoadState>({ loading: true, error: null, data: null });

  // 폼 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 카테고리
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [loadingCats, setLoadingCats] = useState(false);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string>("");

  // 상세 로드
  useEffect(() => {
    if (!faqId || Number.isNaN(faqId)) {
      setLoad({ loading: false, error: "잘못된 공지사항 ID입니다.", data: null });
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoad({ loading: true, error: null, data: null });
        const res = await fetchFaqDetail(faqId);
        const data = normalizeDetail(res);
        if (!alive) return;

        setLoad({ loading: false, error: null, data });

        // 초기값 세팅
        setTitle(data.title ?? "");
        setContent(data.content ?? "");
        setCategoryId(data.category?.categoryId ? String(data.category.categoryId) : "");
      } catch (e: any) {
        if (!alive) return;
        setLoad({
          loading: false,
          error: e?.message ?? "공지사항을 불러오지 못했습니다.",
          data: null,
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [faqId]);

  // 카테고리 목록 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingCats(true);
      try {
        const res = await fetchFaqCategories();
        const list = Array.isArray(res?.data) ? res.data : [];
        if (!alive) return;
        setCategories(list);
      } catch {
        if (!alive) return;
        setCategories([]);
      } finally {
        if (alive) setLoadingCats(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && content.trim().length > 0 && !saving && !load.loading;
  }, [title, content, saving, load.loading]);

  const onCancel = () => {
    router.push(DETAIL_PATH);
  };

  const onSave = async () => {
    setFormError("");

    const t = title.trim();
    const c = content.trim();
    if (!t) return setFormError("제목을 입력하세요.");
    if (!c) return setFormError("내용을 입력하세요.");

    const body: UpdateFaqRequestDto = {
      title: t,
      content: c,
      categoryId: categoryId ? Number(categoryId) : undefined,
    };

    setSaving(true);
    try {
      await updateFaq(faqId, body);
      router.push(DETAIL_PATH);
    } catch (e: any) {
      setFormError(e?.message ?? "수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const data = load.data;

  const badgeStyle = useMemo(() => {
    const bg = data?.category?.bgColorHex ?? "#EEF2F7";
    const fg = data?.category?.textColorHex ?? "#334155";
    return { backgroundColor: bg, color: fg };
  }, [data?.category?.bgColorHex, data?.category?.textColorHex]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* ✅ 상단 라인: breadcrumb + 우측 목록으로 */}
        <div className={styles.breadcrumbRow}>
          <div className={styles.breadcrumb}>
            <span className={styles.crumb} onClick={() => router.push(LIST_PATH)}>
              공지사항
            </span>
            <span className={styles.sep}>›</span>
            <span className={styles.current}>수정페이지</span>
          </div>

          <Button variant="secondary" onClick={() => router.push(LIST_PATH)} disabled={saving}>
            목록으로
          </Button>
        </div>

        <h1 className={styles.title}>공지사항</h1>

        {load.error && <div className={styles.errorMessage}>{load.error}</div>}
        {formError && <div className={styles.errorMessage}>{formError}</div>}

        {load.loading && <div className={styles.loadingBox}>불러오는 중...</div>}

        {!load.loading && data && (
          <div className={styles.detailBox}>
            <div className={styles.headRow}>
              <span className={styles.badge} style={badgeStyle}>
                {data.category?.name ?? "미분류"}
              </span>

              <input
                className={styles.headTitleInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={saving}
                placeholder="제목"
                maxLength={200}
              />
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>작성자</span>
                <span className={styles.metaValue}>{data.authorName || "-"}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>작성일</span>
                <span className={styles.metaValue}>{data.createdAt || "-"}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>조회수</span>
                <span className={styles.metaValue}>{data.viewCount}</span>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>분류</span>
                <select
                  className={styles.categorySelect}
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
            </div>

            <div className={styles.contentBox}>
              <textarea
                className={styles.contentTextarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={saving}
                placeholder="내용을 입력하세요."
                rows={12}
              />
            </div>

            {/* ✅ 하단: 취소 / 수정 */}
            <div className={styles.footerRow}>
              <Button variant="secondary" onClick={onCancel} disabled={saving}>
                취소
              </Button>
              <Button variant="primary" onClick={onSave} disabled={!canSubmit}>
                {saving ? "수정 중..." : "수정"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
