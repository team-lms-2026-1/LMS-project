"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { StatusPill } from "@/components/status";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import toast from "react-hot-toast";

import styles from "@/features/extra-curricular/offerings/components/detail/components/ExtraSessionDetailPanel.module.css";
import { markStudentExtraSessionAttendance } from "../../../api/extraCurricularApi";
import { useStudentExtraSessionDetail } from "../../../hooks/useExtraCurricularOfferingList";
import { extraSessionStatusLabel } from "../../../utils/extraStatusLabel";

type Props = {
  offeringId: number;
  sessionId: number;
  isAttended: boolean;
  onAttended?: () => void | Promise<void>;
};

export function StudentExtraSessionDetailPanel({
  offeringId,
  sessionId,
  isAttended,
  onAttended,
}: Props) {
  const { state } = useStudentExtraSessionDetail(offeringId, sessionId);
  const { data, loading, error } = state;

  const [showPlayer, setShowPlayer] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [watchedSeconds, setWatchedSeconds] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const previewUrl = data?.video?.previewUrl ?? "";
  const canPlay = Boolean(previewUrl);

  const attendancePill = useMemo(() => {
    return isAttended
      ? { status: "ACTIVE" as const, label: "출석완료" }
      : { status: "INACTIVE" as const, label: "미출석" };
  }, [isAttended]);

  useEffect(() => {
    setShowPlayer(false);
    setConfirmOpen(false);
    setConfirmLoading(false);
    setWatchedSeconds(0);
  }, [sessionId]);

  const handleEnded = () => {
    if (isAttended) return;
    const current = videoRef.current?.currentTime ?? 0;
    const duration = data?.video?.durationSeconds ?? 0;
    const watched = Math.max(Math.ceil(current), duration);
    setWatchedSeconds(watched);
    setConfirmOpen(true);
  };

  const handleConfirmAttendance = async () => {
    if (!data) return;
    setConfirmLoading(true);
    const tId = toast.loading("출석 처리 중...");
    try {
      await markStudentExtraSessionAttendance(offeringId, sessionId, watchedSeconds);
      toast.success("출석 처리 완료", { id: tId });
      setConfirmOpen(false);
      if (onAttended) await onAttended();
    } catch (e: any) {
      const msg = e?.message || e?.error?.message || "출석 처리에 실패했습니다.";
      toast.error(msg, { id: tId });
    } finally {
      setConfirmLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.msg}>불러오는 중...</div>;
  }

  if (error || !data) {
    return <div className={`${styles.msg} ${styles.error}`}>회차 정보를 불러오지 못했습니다.</div>;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topBar}>
        <div className={styles.headLeft}>
          <div className={styles.title}>{data.sessionName}</div>
          <div className={styles.period}>
            <span className={styles.periodLabel}>기간</span>
            <span className={styles.periodValue}>
              {data.startAt} ~ {data.endAt}
            </span>
          </div>
        </div>

        <div className={styles.topRight}>
          <StatusPill
            status={data.status as any}
            label={extraSessionStatusLabel(data.status)}
          />
          <span style={{ marginLeft: 8 }}>
            <StatusPill {...attendancePill} />
          </span>
        </div>
      </div>

      <div className={styles.playerOuter}>
        <div className={styles.playerShell}>
          <div className={styles.playerBox}>
            {!showPlayer ? (
              <button
                type="button"
                className={styles.playerCover}
                onClick={() => canPlay && setShowPlayer(true)}
                disabled={!canPlay}
                aria-label="play"
              >
                <div className={styles.coverCenter}>
                  <span className={styles.playCircle}>
                    <span className={styles.playTriangle} />
                  </span>
                </div>
                <div className={styles.coverHint}>
                  {canPlay ? "클릭해서 재생" : "재생 가능한 영상이 없습니다"}
                </div>
              </button>
            ) : (
              <video
                ref={videoRef}
                src={previewUrl}
                controls
                controlsList="nodownload noplaybackrate noremoteplayback"
                disablePictureInPicture
                playsInline
                preload="metadata"
                onContextMenu={(e) => e.preventDefault()}
                onEnded={handleEnded}
                className={styles.video}
              />
            )}
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.metaTop}>
          <span className={styles.videoLabel}>영상</span>
          <span className={styles.videoTitle}>{data.video?.title ?? "-"}</span>
        </div>

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <span className={styles.metaK}>포인트</span>
            <span className={styles.metaV}>{data.rewardPoint ?? 0}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaK}>인정시간</span>
            <span className={styles.metaV}>{data.recognizedHours ?? 0}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaK}>재생시간</span>
            <span className={styles.metaV}>{data.video?.durationSeconds ?? 0}s</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaK}>출석</span>
            <span className={styles.metaV}>{isAttended ? "완료" : "미완료"}</span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="출석 체크"
        description="영상 시청이 완료되었습니다. 출석체크하시겠습니까?"
        confirmText="출석 체크"
        cancelText="취소"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmAttendance}
        loading={confirmLoading}
      />
    </div>
  );
}
