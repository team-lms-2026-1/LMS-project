"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";

import styles from "./ExtraSessionDetailPanel.module.css";
import { useExtraSessionDetail } from "../../../hooks/useExtraSessionDetail";

import { DatePickerInput } from "@/features/authority/semesters/components/ui/DatePickerInput";

import type {
  ExtraOfferingStatus,
  ExtraSessionDetailDto,
  ExtraSessionUpdateRequest,
} from "../../../api/types";

import {
  presignExtraSessionVideoUpload,
  updateExtraSession,
} from "../../../api/extraCurricularOfferingApi";

import { uploadToS3PresignedUrl } from "../../../utils/s3Upload";

type Props = {
  offeringId: number;
  sessionId: number;
  offeringStatus: ExtraOfferingStatus; // ✅ IN_PROGRESS일 때만 수정 활성
  onClose: () => void;
};

function isoToDateOnly(iso?: string | null) {
  if (!iso) return "";
  return String(iso).slice(0, 10);
}
function toStartIso(date: string) {
  return date ? `${date}T00:00:00` : "";
}
function toEndIso(date: string) {
  return date ? `${date}T23:59:59` : "";
}
function formatIsoToYmdHm(iso?: string | null) {
  if (!iso) return "-";
  const s = String(iso);
  const ymd = s.slice(0, 10);
  const hm = s.slice(11, 16);
  if (ymd.length !== 10 || hm.length !== 5) return s;
  return `${ymd} ${hm}`;
}

async function readVideoDurationSeconds(file: File): Promise<number> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    const duration = await new Promise<number>((resolve, reject) => {
      video.onloadedmetadata = () => resolve(video.duration);
      video.onerror = () => reject(new Error("failed_to_load_video_metadata"));
    });
    if (!Number.isFinite(duration) || duration <= 0) return 1;
    return Math.max(1, Math.round(duration));
  } finally {
    URL.revokeObjectURL(url);
  }
}

type PendingVideo = {
  file: File;
  localPreviewUrl: string;
  storageKey: string;
  title: string;
  durationSeconds: number;
};

function buildPatchBody(
  original: ExtraSessionDetailDto,
  form: {
    sessionName: string;
    startDate: string;
    endDate: string;
    rewardPoint: number;
    recognizedHours: number;
    videoTitle: string;
  },
  pendingVideo: PendingVideo | null
): ExtraSessionUpdateRequest {
  const body: ExtraSessionUpdateRequest = {};

  const nextSessionName = form.sessionName.trim();
  if (nextSessionName && nextSessionName !== (original.sessionName ?? "")) {
    body.sessionName = nextSessionName;
  }

  const nextStartAt = toStartIso(form.startDate);
  const nextEndAt = toEndIso(form.endDate);

  if (nextStartAt && nextStartAt !== (original.startAt ?? "")) body.startAt = nextStartAt;
  if (nextEndAt && nextEndAt !== (original.endAt ?? "")) body.endAt = nextEndAt;

  if (Number(form.rewardPoint) !== Number(original.rewardPoint))
    body.rewardPoint = Number(form.rewardPoint);

  if (Number(form.recognizedHours) !== Number(original.recognizedHours))
    body.recognizedHours = Number(form.recognizedHours);

  const videoPatch: any = {};
  const nextVideoTitle = form.videoTitle.trim();
  if (nextVideoTitle && nextVideoTitle !== (original.video?.title ?? "")) {
    videoPatch.title = nextVideoTitle;
  }

  if (pendingVideo) {
    videoPatch.storageKey = pendingVideo.storageKey;
    videoPatch.durationSeconds = pendingVideo.durationSeconds;
    videoPatch.title = pendingVideo.title;
  }

  if (Object.keys(videoPatch).length > 0) body.video = videoPatch;

  return body;
}

export function ExtraSessionDetailPanel({
  offeringId,
  sessionId,
  offeringStatus,
  onClose,
}: Props) {
  const { state, actions } = useExtraSessionDetail(offeringId, sessionId, true);

  const [closing, setClosing] = useState(false);
  const requestClose = () => {
    setClosing(true);
    window.setTimeout(() => onClose(), 520);
  };

  const data = state.data;
  const previewUrl = data?.video?.previewUrl ?? "";

  const [showPlayer, setShowPlayer] = useState(false);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [closeSignal, setCloseSignal] = useState(0);

  const [sessionName, setSessionName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rewardPoint, setRewardPoint] = useState<number>(0);
  const [recognizedHours, setRecognizedHours] = useState<number>(0);
  const [videoTitle, setVideoTitle] = useState("");

  const [pendingVideo, setPendingVideo] = useState<PendingVideo | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const canEdit = useMemo(() => {
    return offeringStatus === "IN_PROGRESS" && data?.status === "OPEN";
  }, [offeringStatus, data?.status]);

  const canPlay = useMemo(() => {
    return !!previewUrl && !state.loading && !state.error;
  }, [previewUrl, state.loading, state.error]);

  useEffect(() => {
    if (!data) return;
    setSessionName(data.sessionName ?? "");
    setStartDate(isoToDateOnly(data.startAt));
    setEndDate(isoToDateOnly(data.endAt));
    setRewardPoint(Number(data.rewardPoint ?? 0));
    setRecognizedHours(Number(data.recognizedHours ?? 0));
    setVideoTitle(data.video?.title ?? "");
  }, [data?.sessionId]);

  useEffect(() => {
    return () => {
      if (pendingVideo?.localPreviewUrl) URL.revokeObjectURL(pendingVideo.localPreviewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEdit = () => {
    if (!data) return;
    if (!canEdit) {
      toast("운영이 진행중(IN_PROGRESS)이고 회차가 OPEN일 때만 수정할 수 있습니다.");
      return;
    }
    setEditing(true);
    setPendingVideo(null);
    setShowPlayer(false);
  };

  const cancelEdit = () => {
    if (!data) return;
    setCloseSignal((v) => v + 1);

    setSessionName(data.sessionName ?? "");
    setStartDate(isoToDateOnly(data.startAt));
    setEndDate(isoToDateOnly(data.endAt));
    setRewardPoint(Number(data.rewardPoint ?? 0));
    setRecognizedHours(Number(data.recognizedHours ?? 0));
    setVideoTitle(data.video?.title ?? "");

    if (pendingVideo?.localPreviewUrl) URL.revokeObjectURL(pendingVideo.localPreviewUrl);
    setPendingVideo(null);

    setEditing(false);
  };

  const validate = () => {
    if (!sessionName.trim()) return "회차명을 입력하세요.";
    if (!startDate) return "시작일을 선택하세요.";
    if (!endDate) return "종료일을 선택하세요.";
    if (startDate > endDate) return "시작일은 종료일보다 늦을 수 없습니다.";
    if (rewardPoint < 0) return "포인트는 0 이상이어야 합니다.";
    if (recognizedHours < 0) return "인정시간은 0 이상이어야 합니다.";
    if (uploadingVideo) return "영상 업로드가 끝날 때까지 기다려 주세요.";
    return null;
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const f = acceptedFiles?.[0];
    if (!f) return;

    try {
      setUploadingVideo(true);

      let dur = 1;
      try {
        dur = await readVideoDurationSeconds(f);
      } catch {
        dur = 1;
      }

      const presignRes = await presignExtraSessionVideoUpload(offeringId, {
        originalFileName: f.name,
        contentType: f.type || "video/mp4",
        contentLength: f.size,
      });

      const { storageKey, uploadUrl } = presignRes.data;

      await uploadToS3PresignedUrl({
        uploadUrl,
        file: f,
        contentType: f.type || "video/mp4",
      });

      setPendingVideo((prev) => {
        if (prev?.localPreviewUrl) URL.revokeObjectURL(prev.localPreviewUrl);
        return prev;
      });

      const localPreviewUrl = URL.createObjectURL(f);

      setPendingVideo({
        file: f,
        localPreviewUrl,
        storageKey,
        title: f.name,
        durationSeconds: dur,
      });

      toast.success("영상 업로드 완료. 저장을 누르면 반영됩니다.");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.error?.message ?? e?.message ?? "영상 업로드 실패");
    } finally {
      setUploadingVideo(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    accept: { "video/*": [] },
    disabled: uploadingVideo || saving || !editing,
    maxFiles: 1,
  });

  const handleSave = async () => {
    const msg = validate();
    if (msg) {
      toast.error(msg);
      return;
    }
    if (!data) return;

    const patchBody = buildPatchBody(
      data,
      { sessionName, startDate, endDate, rewardPoint, recognizedHours, videoTitle },
      pendingVideo
    );

    if (Object.keys(patchBody).length === 0) {
      toast("변경된 내용이 없습니다.");
      setEditing(false);
      return;
    }

    try {
      setSaving(true);
      await updateExtraSession(offeringId, sessionId, patchBody);

      toast.success("회차가 수정되었습니다.");

      setCloseSignal((v) => v + 1);
      setEditing(false);

      if (pendingVideo?.localPreviewUrl) URL.revokeObjectURL(pendingVideo.localPreviewUrl);
      setPendingVideo(null);

      await actions.reload();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.error?.message ?? e?.message ?? "수정 실패");
    } finally {
      setSaving(false);
    }
  };

  const playerSrc = pendingVideo?.localPreviewUrl || previewUrl;

  return (
    <div className={`${styles.wrap} ${closing ? styles.closing : ""}`}>
      <div className={styles.innerFade}>
        <div className={styles.topBar}>
          <div className={styles.headLeft}>
            <div className={styles.title}>
              {editing ? (
                <input
                  className={styles.titleInput}
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  disabled={saving}
                />
              ) : (
                data?.sessionName ?? "회차"
              )}
            </div>

            {data && (
              <div className={styles.period}>
                <span className={styles.periodLabel}>시청기간</span>
                <span className={styles.periodValue} title={`${data.startAt} ~ ${data.endAt}`}>
                  {formatIsoToYmdHm(data.startAt)} ~ {formatIsoToYmdHm(data.endAt)}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            className={styles.collapseBtn}
            onClick={() => {
              setCloseSignal((v) => v + 1);
              requestClose();
            }}
            aria-label="접기"
            title="접기"
          >
            <span className={styles.arrowUp}>⌃</span>
          </button>
        </div>

        {state.loading && <div className={styles.msg}>불러오는 중...</div>}
        {state.error && <div className={styles.error}>{state.error}</div>}

        {/* ✅ 영상은 가운데 + max-width 제한 */}
        <div className={styles.playerOuter}>
          <div className={styles.playerShell}>
            <div className={styles.playerBox}>
              {!showPlayer ? (
                <button
                  type="button"
                  className={styles.playerCover}
                  onClick={() => canPlay && setShowPlayer(true)}
                  disabled={!canPlay}
                  aria-label="재생"
                  title={canPlay ? "재생" : "재생 불가"}
                >
                  <span className={styles.playCircle}>
                    <span className={styles.playTriangle} />
                  </span>
                  <div className={styles.coverHint}>
                    {canPlay ? "클릭해서 재생" : "재생할 수 없습니다"}
                  </div>
                </button>
              ) : (
                <video
                  src={playerSrc}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  className={styles.video}
                  controlsList="nodownload noplaybackrate noremoteplayback"
                  disablePictureInPicture
                  onContextMenu={(e) => e.preventDefault()}
                />
              )}
            </div>
          </div>
        </div>

        {data && (
          <div className={styles.bottom}>
            <div className={styles.metaTop}>
              <span className={styles.videoLabel}>영상</span>
              <span
                className={styles.videoTitle}
                title={pendingVideo ? pendingVideo.title : (data.video?.title ?? "-")}
              >
                {pendingVideo ? pendingVideo.title : (data.video?.title ?? "-")}
                {pendingVideo ? <span className={styles.pendingBadge}>교체 대기</span> : null}
              </span>
            </div>

            {editing ? (
              <div className={styles.editGrid}>
                <div className={styles.editRow2}>
                  <div className={styles.field}>
                    <div className={styles.label}>시작일</div>
                    <DatePickerInput
                      value={startDate}
                      onChange={(v) => {
                        setStartDate(v);
                        if (endDate && v > endDate) setEndDate("");
                      }}
                      placeholder="시작일 선택"
                      closeSignal={closeSignal}
                    />
                  </div>

                  <div className={styles.field}>
                    <div className={styles.label}>종료일</div>
                    <DatePickerInput
                      value={endDate}
                      onChange={setEndDate}
                      placeholder="종료일 선택"
                      min={startDate || undefined}
                      closeSignal={closeSignal}
                    />
                  </div>
                </div>

                <div className={styles.editRow2}>
                  <label className={styles.field}>
                    <div className={styles.label}>포인트</div>
                    <input
                      className={styles.control}
                      type="number"
                      min={0}
                      value={rewardPoint}
                      onChange={(e) => setRewardPoint(Number(e.target.value))}
                      disabled={saving}
                    />
                  </label>

                  <label className={styles.field}>
                    <div className={styles.label}>인정시간</div>
                    <input
                      className={styles.control}
                      type="number"
                      min={0}
                      value={recognizedHours}
                      onChange={(e) => setRecognizedHours(Number(e.target.value))}
                      disabled={saving}
                    />
                  </label>
                </div>

                <label className={styles.field}>
                  <div className={styles.label}>영상 제목</div>
                  <input
                    className={styles.control}
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    disabled={saving}
                  />
                </label>

                <div className={styles.replaceBlock}>
                  <div className={styles.replaceHead}>
                    <div className={styles.replaceTitle}>영상 교체</div>
                    <div className={styles.replaceHint}>
                      업로드 후 <b>저장</b>을 눌러야 반영됩니다.
                    </div>
                  </div>

                  <div
                    {...getRootProps({
                      className: `${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ""} ${
                        uploadingVideo ? styles.dropzoneDisabled : ""
                      }`,
                    })}
                  >
                    <input {...getInputProps()} />

                    <div className={styles.dropzoneInner}>
                      <div className={styles.dropTitle}>
                        {uploadingVideo ? "업로드 중..." : "새 영상을 드래그&드롭"}
                      </div>

                      <div className={styles.dropSub} title={pendingVideo ? pendingVideo.file.name : ""}>
                        {pendingVideo
                          ? `${pendingVideo.file.name} · ${pendingVideo.durationSeconds}s`
                          : "또는 버튼으로 파일을 선택하세요."}
                      </div>

                      <div className={styles.dropActions}>
                        <button
                          type="button"
                          className={styles.pickBtn}
                          onClick={openFileDialog}
                          disabled={uploadingVideo || saving}
                        >
                          파일 선택
                        </button>

                        {pendingVideo && (
                          <button
                            type="button"
                            className={styles.clearBtn}
                            onClick={() => {
                              if (pendingVideo.localPreviewUrl)
                                URL.revokeObjectURL(pendingVideo.localPreviewUrl);
                              setPendingVideo(null);
                              toast("영상 교체 대기를 취소했습니다.");
                            }}
                            disabled={uploadingVideo || saving}
                          >
                            취소
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    className={styles.btnPrimary}
                    onClick={handleSave}
                    disabled={saving || uploadingVideo}
                  >
                    {saving ? "저장 중..." : "저장"}
                  </button>
                  <button
                    className={styles.btnSecondary}
                    onClick={cancelEdit}
                    disabled={saving || uploadingVideo}
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.metaRow}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaK}>포인트</span>
                    <span className={styles.metaV}>{data.rewardPoint}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaK}>인정시간</span>
                    <span className={styles.metaV}>{data.recognizedHours}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaK}>영상길이</span>
                    <span className={styles.metaV}>{data.video?.durationSeconds ?? 0}s</span>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    className={styles.btnSecondary}
                    onClick={openEdit}
                    disabled={!canEdit}
                    title={
                      canEdit
                        ? "수정"
                        : "운영이 진행중(IN_PROGRESS)이고 회차가 OPEN일 때만 수정할 수 있습니다."
                    }
                  >
                    수정
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
