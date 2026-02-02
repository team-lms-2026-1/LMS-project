"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./ResourceEditPage.module.css";
import type { Category, ResourceListItemDto, UpdateResourceRequestDto } from "../../api/types";
import { fetchResourceCategories, fetchResourceDetail, updateResource } from "../../api/ResourcesApi";
import { Button } from "@/components/button";

type LoadState =
  | { loading: true; error: string | null; data: null }
  | { loading: false; error: string | null; data: ResourceListItemDto | null };

function normalizeDetail(payload: any): ResourceListItemDto {
  const raw = payload?.data ?? payload;
  const created = raw?.createAt ?? raw?.createdAt ?? raw?.cerateAt ?? raw?.create_at ?? "";

  return {
    resourceId: Number(raw?.resourceId ?? 0),
    category: raw?.category,
    title: String(raw?.title ?? ""),
    content: String(raw?.content ?? ""),
    authorName: String(raw?.authorName ?? ""),
    viewCount: Number(raw?.viewCount ?? 0),
    createdAt: String(created),
    files: Array.isArray(raw?.files) ? raw.files : [],
  };
}

export default function ResourceEditPageClient() {
  const router = useRouter();
  const params = useParams<{ resourceId?: string }>();
  const resourceId = useMemo(() => Number(params?.resourceId ?? 0), [params]);

  const LIST_PATH = "/admin/community/resources";
  const DETAIL_PATH = `/admin/community/resources/${resourceId}`;

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
    if (!resourceId || Number.isNaN(resourceId)) {
      setLoad({ loading: false, error: "잘못된 공지사항 ID입니다.", data: null });
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoad({ loading: true, error: null, data: null });
        const res = await fetchResourceDetail(resourceId);
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
  }, [resourceId]);

  // 카테고리 목록 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingCats(true);
      try {
        const res = await fetchResourceCategories();
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

    const body: UpdateResourceRequestDto = {
      title: t,
      content: c,
      categoryId: categoryId ? Number(categoryId) : undefined,
    };

    setSaving(true);
    try {
      await updateResource(resourceId, body);
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
              자료실
            </span>
            <span className={styles.sep}>›</span>
            <span className={styles.current}>수정페이지</span>
          </div>

          <Button variant="secondary" onClick={() => router.push(LIST_PATH)} disabled={saving}>
            목록으로
          </Button>
        </div>

        <h1 className={styles.title}>자료실</h1>

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

            <div className={styles.attachBox}>
              <div className={styles.attachRow}>
                <div className={styles.attachLabel}>첨부</div>
                <div className={styles.attachList}>
                  {Array.isArray(data.files) && data.files.length > 0 ? (
                    <ul className={styles.attachUl}>
                      {data.files.map((f: any, idx: number) => {
                        const name =
                          typeof f === "string"
                            ? f
                            : String(f?.fileName ?? f?.name ?? f?.originalName ?? `첨부파일 ${idx + 1}`);
                        return (
                          <li key={idx} className={styles.attachLi}>
                            <span className={styles.attachName}>{name}</span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className={styles.attachEmpty}>첨부파일 없음</div>
                  )}
                </div>
              </div>
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
