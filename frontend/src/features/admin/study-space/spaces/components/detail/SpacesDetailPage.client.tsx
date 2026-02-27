"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./SpacesDetailPage.module.css";

import { spacesApi } from "../../api/spacesApi";
import type { SpaceDetailDto } from "../../api/types";
import { Button } from "@/components/button";
import SpacesRoomModal from "../modal/SpacesRoomModal.client";
import SpacesDeleteModal from "../modal/SpacesDeleteModal.client";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  spaceId: number;
};

export default function SpacesDetailPageClient({ spaceId }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const toastOnceRef = useRef<string | null>(null);
  const t = useI18n("studySpace.admin.spaces.detail");

  const [data, setData] = useState<SpaceDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [roomOpen, setRoomOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const toastType = sp.get("toast");
    if (!toastType) return;
    if (toastOnceRef.current === toastType) return;
    toastOnceRef.current = toastType;

    if (toastType === "created") toast.success(t("toasts.created"), { id: "space-toast-created" });
    else if (toastType === "updated") toast.success(t("toasts.updated"), { id: "space-toast-updated" });

    const next = new URLSearchParams(sp.toString());
    next.delete("toast");
    const qs = next.toString();
    router.replace(qs ? `/admin/study-space/spaces/${spaceId}?${qs}` : `/admin/study-space/spaces/${spaceId}`);
  }, [sp, router, spaceId, t]);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!Number.isFinite(spaceId)) return;
      setLoading(true);
      setError("");

      try {
        const res = await spacesApi.detail(spaceId);
        if (!alive) return;
        setData(res.data);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || t("errors.loadFailed"));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [spaceId, t]);

  const mainImageUrl = useMemo(() => {
    const imgs = data?.images ?? [];
    const sorted = [...imgs].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return sorted[0]?.imageUrl || "/images/placeholder.png";
  }, [data]);

  const rulesSorted = useMemo(() => {
    const rules = data?.rules ?? [];
    return [...rules].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [data]);

  const onClickManage = () => {
    setRoomOpen(true);
  };

  const onClickEdit = () => {
    router.push(`/admin/study-space/spaces/${spaceId}/edit`);
  };

  const onGoList = () => {
    router.push("/admin/study-space/spaces");
  };

  const onClickDelete = () => {
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (deleting) return;

    try {
      setDeleting(true);
      await spacesApi.remove(spaceId);
      router.push("/admin/study-space/spaces?toast=deleted");
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message || t("errors.deleteFailed"));
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.leftGroup}>
          <button type="button" className={styles.backTextBtn} onClick={onGoList}>
            {t("breadcrumb.root")}
          </button>
          <div className={styles.breadcrumb}>&gt; {t("breadcrumb.current")}</div>
        </div>

        <Button variant="secondary" onClick={onGoList}>
          {t("buttons.list")}
        </Button>
      </div>

      <div className={styles.card}>
        {loading && <div className={styles.infoBox}>{t("loading")}</div>}
        {error && <div className={styles.errorBox}>{error}</div>}

        {data && (
          <div className={styles.content}>
            {/* 좌측: 이미지 + 규칙 */}
            <div className={styles.left}>
              <div className={styles.imageWrap}>
                <img className={styles.image} src={mainImageUrl} alt={data.spaceName} />
              </div>

              <div className={styles.rules}>
                {rulesSorted.map((r, idx) => (
                  <div key={r.ruleId} className={styles.ruleRow}>
                    <span className={styles.ruleIndex}>{idx + 1}</span>
                    <span className={styles.ruleText}>{r.content}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 우측: 제목/설명 + 관리 버튼 */}
            <div className={styles.right}>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>{data.spaceName}</h1>
                <div className={styles.location}>{data.location}</div>
              </div>

              <p className={styles.desc}>{data.description}</p>

              <div className={styles.manageRow}>
                <Button variant="secondary" onClick={onClickManage}>
                  {t("buttons.manageRooms")}
                </Button>
              </div>

              <div className={styles.divider} />
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className={styles.bottomActions}>
        <Button variant="secondary" onClick={onClickEdit}>
          {t("buttons.edit")}
        </Button>

        <Button className={styles.dangerBtn} variant="primary" onClick={onClickDelete}>
          {t("buttons.delete")}
        </Button>
      </div>

      {/* ✅ 그룹 스터디실 관리 모달 (모달 내부에서 API 처리) */}
      <SpacesRoomModal open={roomOpen} onClose={() => setRoomOpen(false)} spaceId={spaceId} />
      <SpacesDeleteModal
        open={deleteOpen}
        targetTitle={data?.spaceName}
        loading={deleting}
        onClose={() => {
          if (deleting) return;
          setDeleteOpen(false);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
