"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { StatusPill } from "@/components/status";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import { useI18n } from "@/i18n/useI18n";
import toast from "react-hot-toast";

import styles from "@/features/admin/extra-curricular/offerings/components/detail/components/ExtraSessionDetailPanel.module.css";
import { markStudentExtraSessionAttendance } from "../../../api/extraCurricularApi";
import { useStudentExtraSessionDetail } from "../../../hooks/useExtraCurricularOfferingList";

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
  const t = useI18n("extraCurricular.studentOfferingDetail.sessionDetail");
  const tSessionStatus = useI18n("extraCurricular.status.session");
  const tAttendanceStatus = useI18n("extraCurricular.status.attended");
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
      ? { status: "ACTIVE" as const, label: tAttendanceStatus("ATTENDED") }
      : { status: "INACTIVE" as const, label: tAttendanceStatus("ABSENT") };
  }, [isAttended, tAttendanceStatus]);

  const sessionStatusLabel = (value: string) => {
    switch (value) {
      case "OPEN":
        return tSessionStatus("OPEN");
      case "CLOSED":
        return tSessionStatus("CLOSED");
      case "CANCELED":
        return tSessionStatus("CANCELED");
      default:
        return value;
    }
  };

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
    const tId = toast.loading(t("messages.attendanceLoading"));
    try {
      await markStudentExtraSessionAttendance(offeringId, sessionId, watchedSeconds);
      toast.success(t("messages.attendanceSuccess"), { id: tId });
      setConfirmOpen(false);
      if (onAttended) await onAttended();
    } catch (e: any) {
      const msg = e?.message || e?.error?.message || t("messages.attendanceFailed");
      toast.error(msg, { id: tId });
    } finally {
      setConfirmLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.msg}>{t("loading")}</div>;
  }

  if (error || !data) {
    return <div className={`${styles.msg} ${styles.error}`}>{t("loadError")}</div>;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topBar}>
        <div className={styles.headLeft}>
          <div className={styles.title}>{data.sessionName}</div>
          <div className={styles.period}>
            <span className={styles.periodLabel}>{t("labels.period")}</span>
            <span className={styles.periodValue}>
              {data.startAt} ~ {data.endAt}
            </span>
          </div>
        </div>

        <div className={styles.topRight}>
          <StatusPill
            status={data.status as any}
            label={sessionStatusLabel(data.status)}
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
                aria-label={t("labels.play")}
              >
                <div className={styles.coverCenter}>
                  <span className={styles.playCircle}>
                    <span className={styles.playTriangle} />
                  </span>
                </div>
                <div className={styles.coverHint}>
                  {canPlay ? t("messages.clickToPlay") : t("messages.noPlayableVideo")}
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
          <span className={styles.videoLabel}>{t("labels.video")}</span>
          <span className={styles.videoTitle}>{data.video?.title ?? "-"}</span>
        </div>

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <span className={styles.metaK}>{t("labels.rewardPoint")}</span>
            <span className={styles.metaV}>{data.rewardPoint ?? 0}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaK}>{t("labels.recognizedHours")}</span>
            <span className={styles.metaV}>{data.recognizedHours ?? 0}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaK}>{t("labels.playbackDuration")}</span>
            <span className={styles.metaV}>{data.video?.durationSeconds ?? 0}s</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaK}>{t("labels.attendance")}</span>
            <span className={styles.metaV}>
              {isAttended ? t("labels.attendanceCompleted") : t("labels.attendanceIncomplete")}
            </span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={t("dialog.title")}
        description={t("dialog.description")}
        confirmText={t("dialog.confirmText")}
        cancelText={t("dialog.cancelText")}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmAttendance}
        loading={confirmLoading}
      />
    </div>
  );
}
