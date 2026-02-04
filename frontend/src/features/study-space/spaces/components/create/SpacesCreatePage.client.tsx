"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./SpacesCreatePage.module.css";

import { spacesApi } from "../../api/SpacesApi";
import type { CreateSpaceDetailRequestDto, SpaceRuleUpsertDto } from "../../api/types";
import { Button } from "@/components/button";

type RuleRowState = {
  content: string;
  sortOrder: number;

  // UI용
  isEditing?: boolean;
  draft?: string;
};

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

export default function SpacesCreatePageClient() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);

  const [spaceName, setSpaceName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  // ✅ 등록은 기존 이미지 개념이 없고 새 이미지 1장만
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [rules, setRules] = useState<RuleRowState[]>([
    // 기본 1줄을 미리 두고 싶으면 아래처럼 시작해도 됨
    // { content: "", sortOrder: 1, isEditing: true, draft: "" },
  ]);

  const previewUrl = useMemo(() => {
    if (!imageFile) return "";
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  const onPickImage = (file: File | null) => {
    if (!file) return;
    if (!isImageFile(file)) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    // ✅ 1개만: 새로 선택하면 교체
    setImageFile(file);
  };

  const onRemoveImage = () => {
    setImageFile(null);
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
      // ✅ sortOrder 재정렬(수정 페이지와 동일하게 1-based)
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

        // 새로 추가된 빈 룰이면 취소 시 삭제
        const isNewEmpty = (r.content ?? "").trim() === "" && (r.draft ?? "").trim() === "";
        if (isNewEmpty) return r; // 아래에서 제거

        return { ...r, isEditing: false, draft: r.content };
      })
    );

    // 방금 추가한 빈 룰이면 제거
    setRules((prev) => {
      const target = prev[idx];
      if (!target) return prev;
      const isNewEmpty = (target.content ?? "").trim() === "" && (target.draft ?? "").trim() === "";
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
    // 등록 취소 => 목록으로
    router.push("/admin/study-space/spaces");
  };

  const onSubmit = async () => {
    if (!spaceName.trim()) return alert("공간 이름을 입력하세요.");
    if (!location.trim()) return alert("위치를 입력하세요.");
    if (!description.trim()) return alert("설명을 입력하세요.");

    // ✅ 룰 정리(공백 제거)
    const cleanedRules = rules
      .map((r, i) => ({
        content: (r.content ?? "").trim(),
        sortOrder: i + 1,
      }))
      .filter((r) => r.content.length > 0);

    const dto: CreateSpaceDetailRequestDto = {
      spaceName: spaceName.trim(),
      location: location.trim(),
      description: description.trim(),
      rules: cleanedRules as SpaceRuleUpsertDto[],
    };

    try {
      setSaving(true);

      // ✅ 등록은 multipart로
      const created = await spacesApi.createDetailMultipart(dto, imageFile);

      alert("등록되었습니다.");

      // ✅ 등록 후 상세로 이동(응답에 spaceId가 있으면)
      const createdId = created?.data?.spaceId;
      if (createdId) {
        router.push(`/admin/study-space/spaces/${createdId}`);
      } else {
        router.push("/admin/study-space/spaces");
      }
      router.refresh();
    } catch (e: any) {
      console.error("[SpacesCreate submit]", e);
      alert(e?.message || "등록 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}> &gt; 학습공간 등록</div>

      <div className={styles.card}>
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
              <Button variant="secondary" onClick={onRemoveImage} disabled={!imageFile}>
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
            <div key={`new-${idx}`} className={styles.ruleRow}>
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

        {/* 하단 버튼: 취소 / 등록 */}
        <div className={styles.bottomActions}>
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            취소
          </Button>
          <Button variant="primary" onClick={onSubmit} disabled={saving}>
            {saving ? "등록 중..." : "등록"}
          </Button>
        </div>
      </div>
    </div>
  );
}
