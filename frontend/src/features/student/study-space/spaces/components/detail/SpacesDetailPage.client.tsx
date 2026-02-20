"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./SpacesDetailPage.module.css";

import { spacesApi } from "../../api/spacesApi";
import type { SpaceDetailDto } from "../../api/types";
import { Button } from "@/components/button";
import SpacesModal from "../modal/SpacesModal.client";

type Props = {
  spaceId: number;
};

export default function SpacesDetailPageClient({ spaceId }: Props) {
  const router = useRouter();

  const [data, setData] = useState<SpaceDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [roomOpen, setRoomOpen] = useState(false);

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
        setError(e?.message || "상세 조회 중 오류가 발생했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [spaceId]);

  const mainImageUrl = useMemo(() => {
    const imgs = data?.images ?? [];
    const sorted = [...imgs].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return sorted[0]?.imageUrl || "/images/placeholder.png";
  }, [data]);

  const rulesSorted = useMemo(() => {
    const rules = data?.rules ?? [];
    return [...rules].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [data]);

  const onClickReserve = () => {
    setRoomOpen(true);
  };

  const onGoList = () => {
    router.push("/student/study-space/spaces");
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.leftGroup}>
          <button type="button" className={styles.backTextBtn} onClick={onGoList}>
            학습공간
          </button>
          <div className={styles.breadcrumb}>&gt; 학습공간 상세페이지</div>
        </div>

        <Button variant="secondary" onClick={onGoList}>
          목록으로
        </Button>
      </div>

      <div className={styles.card}>
        {loading && <div className={styles.infoBox}>로딩 중...</div>}
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

            {/* 우측: 제목/설명 + 예약 버튼 */}
            <div className={styles.right}>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>{data.spaceName}</h1>
                <div className={styles.location}>{data.location}</div>
              </div>

              <p className={styles.desc}>{data.description}</p>

              <div className={styles.manageRow}>
                <Button variant="secondary" onClick={onClickReserve}>
                  그룹 스터디실 예약하기
                </Button>
              </div>

              <div className={styles.divider} />
            </div>
          </div>
        )}
      </div>
      <SpacesModal open={roomOpen} onClose={() => setRoomOpen(false)} spaceId={spaceId} />
    </div>
  );
}
