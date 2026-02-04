"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./SpacesEditPage.module.css";

import { spacesApi } from "../../api/SpacesApi";
import type { SpaceDetailDto, SpaceRuleUpsertDto, UpdateSpaceDetailRequestDto } from "../../api/types";
import { Button } from "@/components/button";

type Props = { spaceId: number };

type RuleRowState = {
  ruleId?: number;
  content: string;
  sortOrder: number;

  // UI용
  isEditing?: boolean;
  draft?: string;
};

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

export default function SpacesEditPageClient({ spaceId }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const [spaceName, setSpaceName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  
  const [originImageUrl, setOriginImageUrl] = useState<string>(""); // 기존 대표 이미지(정렬 1)
  const [imageFile, setImageFile] = useState<File | null>(null);    // 새로 올린 이미지
  const [deleteOriginImage, setDeleteOriginImage] = useState(false); // 기존 이미지 삭제 의사

  const [rules, setRules] = useState<RuleRowState[]>([]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await spacesApi.detail(spaceId);
        if (!alive) return;

        const d: SpaceDetailDto = res.data;

        setSpaceName(d.spaceName);
        setLocation(d.location);
        setDescription(d.description);

        const main = [...(d.images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)[0]?.imageUrl ?? "";
        setOriginImageUrl(main);
        setImageFile(null);
        setDeleteOriginImage(false);

        const rs = [...(d.rules ?? [])]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((r) => ({
            ruleId: r.ruleId,
            content: r.content,
            sortOrder: r.sortOrder,
            isEditing: false,
            draft: r.content,
          }));

        setRules(rs);
      } catch (e: any) {
        console.error("[SpacesEditPage]", e);
        setError(e?.message || "상세 조회 중 오류가 발생했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [spaceId]);

  const previewUrl = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    if (deleteOriginImage) return "";
    return originImageUrl;
  }, [imageFile, originImageUrl, deleteOriginImage]);

  const onPickImage = (file: File | null) => {
    if (!file) return;
    if (!isImageFile(file)) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    setImageFile(file);
    setDeleteOriginImage(false); 
  };

  const onRemoveImage = () => {
    
    if (imageFile) {
      setImageFile(null);
      return;
    }
    if (originImageUrl) setDeleteOriginImage(true);
  };

  const onAddRule = () => {
    const nextSort = rules.length + 1;
    setRules((prev) => [
      ...prev,
      {
        content: "",
        sortOrder: nextSort,
        isEditing: true,
        draft: "",
      },
    ]);
  };

  const onDeleteRule = (idx: number) => {
    setRules((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.map((r, i) => ({ ...r, sortOrder: i + 1 }));
    });
  };

  const onEditRule = (idx: number) => {
    setRules((prev) => prev.map((r, i) => (i === idx ? { ...r, isEditing: true, draft: r.content } : r)));
  };

  const onCancelEditRule = (idx: number) => {
    setRules((prev) =>
      prev.map((r, i) => {
        if (i !== idx) return r;
        if (!r.ruleId && (!r.content || r.content.trim() === "") && (r.draft ?? "").trim() === "") {
          return r; 
        }
        return { ...r, isEditing: false, draft: r.content };
      })
    );

    setRules((prev) => {
      const target = prev[idx];
      if (!target) return prev;
      const isNewEmpty =
        !target.ruleId && (target.content ?? "").trim() === "" && (target.draft ?? "").trim() === "";
      if (!isNewEmpty) return prev;
      const next = prev.filter((_, i) => i !== idx);
      return next.map((r, i) => ({ ...r, sortOrder: i + 1 }));
    });
  };

  const onSaveRule = (idx: number) => {
    setRules((prev) =>
      prev.map((r, i) => {
        if (i !== idx) return r;
        const nextContent = (r.draft ?? "").trim();
        if (!nextContent) {
          alert("룰 내용을 입력하세요.");
          return r;
        }
        return { ...r, content: nextContent, isEditing: false };
      })
    );
  };

  const onChangeRuleDraft = (idx: number, value: string) => {
    setRules((prev) => prev.map((r, i) => (i === idx ? { ...r, draft: value } : r)));
  };

  const onCancel = () => {
    router.push(`/admin/study-space/spaces/${spaceId}`);
  };

  const onSubmit = async () => {
    if (!spaceName.trim()) return alert("공간 이름을 입력하세요.");
    if (!location.trim()) return alert("위치를 입력하세요.");
    if (!description.trim()) return alert("설명을 입력하세요.");

    const cleanedRules = rules
      .map((r, i) => ({
        ruleId: r.ruleId,
        content: (r.content ?? "").trim(),
        sortOrder: i + 1,
      }))
      .filter((r) => r.content.length > 0);

    const dto: UpdateSpaceDetailRequestDto = {
      spaceName: spaceName.trim(),
      location: location.trim(),
      description: description.trim(),
      rules: cleanedRules as SpaceRuleUpsertDto[],
      deleteMainImage: deleteOriginImage && !imageFile ? true : false,
    };

    try {
      setSaving(true);

      await spacesApi.updateDetailMultipart(spaceId, dto, imageFile);

      alert("수정되었습니다.");
      router.push(`/admin/study-space/spaces/${spaceId}`);
      router.refresh();
    } catch (e: any) {
      console.error("[SpacesEdit submit]", e);
      alert(e?.message || "수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}> &gt; 학습공간 상세페이지</div>

      <div className={styles.card}>
        {loading && <div className={styles.infoBox}>로딩 중...</div>}
        {error && <div className={styles.errorBox}>{error}</div>}

        {!loading && !error && (
          <>
            <div className={styles.topGrid}>
              {/* 이미지 업로드 */}
              <div className={styles.imagePanel}>
                <label className={styles.imageBox}>
                  <input
                    className={styles.fileInput}
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
                  />

                  {previewUrl ? (
                    <img className={styles.previewImg} src={previewUrl} alt="preview" />
                  ) : (
                    <div className={styles.dropText}>
                      <div className={styles.dropTitle}>Drop here to attach or upload</div>
                      <div className={styles.dropHint}>이미지 파일 1개만 업로드 가능</div>
                    </div>
                  )}
                </label>

                <div className={styles.imageActions}>
                  <div className={styles.imageRule}>※ 이미지 파일만 / 1개만 가능</div>
                  <Button variant="secondary" onClick={onRemoveImage} disabled={!originImageUrl && !imageFile}>
                    삭제
                  </Button>
                </div>
              </div>

              {/* 텍스트 폼 */}
              <div className={styles.formPanel}>
                <div className={styles.nameRow}>
                  <input
                    className={styles.nameInput}
                    value={spaceName}
                    onChange={(e) => setSpaceName(e.target.value)}
                    placeholder="공간 이름"
                  />
                </div>

                <div className={styles.locationRow}>
                  <input
                    className={styles.locationInput}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="위치"
                  />
                </div>

                <textarea
                  className={styles.descTextarea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="공간 설명"
                />
              </div>
            </div>

            <div className={styles.divider} />

            {/* 룰 목록 */}
            <div className={styles.rules}>
              {rules.map((r, idx) => (
                <div key={`${r.ruleId ?? "new"}-${idx}`} className={styles.ruleRow}>
                  <div className={styles.ruleIndex}>{idx + 1}</div>

                  <div className={styles.ruleContent}>
                    {r.isEditing ? (
                      <input
                        className={styles.ruleInput}
                        value={r.draft ?? ""}
                        onChange={(e) => onChangeRuleDraft(idx, e.target.value)}
                        placeholder="룰 내용을 입력하세요"
                      />
                    ) : (
                      <div className={styles.ruleText}>{r.content}</div>
                    )}
                  </div>

                  <div className={styles.ruleActions}>
                    {r.isEditing ? (
                      <>
                        <Button variant="secondary" onClick={() => onCancelEditRule(idx)}>
                          취소
                        </Button>
                        <Button variant="primary" onClick={() => onSaveRule(idx)}>
                          저장
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="secondary" onClick={() => onEditRule(idx)}>
                          수정
                        </Button>
                        <Button className={styles.dangerBtn} variant="secondary" onClick={() => onDeleteRule(idx)}>
                          삭제
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              <div className={styles.addRow}>
                <button type="button" className={styles.addBtn} onClick={onAddRule} aria-label="add rule">
                  +
                </button>
              </div>
            </div>

            <div className={styles.bottomActions}>
              <Button variant="secondary" onClick={onCancel} disabled={saving}>
                취소
              </Button>
              <Button variant="primary" onClick={onSubmit} disabled={saving}>
                {saving ? "수정 중..." : "수정"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
