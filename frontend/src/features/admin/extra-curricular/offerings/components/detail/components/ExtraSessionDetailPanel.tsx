"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";

import styles from "./ExtraSessionDetailPanel.module.css"
import { useI18n } from "@/i18n/useI18n";

import { DatePickerInput } from "@/features/admin/authority/semesters/components/ui/DatePickerInput";
import { Dropdown, type DropdownOption } from "@/features/dropdowns/_shared/Dropdown";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";

import type {
  ExtraSessionDetailDto,
  ExtraSessionUpdateRequest,
  ExtraSessionStatus,
} from "../../../api/types";

import {
  presignExtraSessionVideoUpload,
  updateExtraSession,
  changeExtraSessionStatus,
} from "../../../api/extraCurricularOfferingApi";

import { uploadToS3PresignedUrl } from "../../../utils/s3Upload";
import { useExtraSessionDetail } from "../../../hooks/useExtraCurricularOfferingList";

type Props = {
  offeringId: number;
  sessionId: number;
  offeringStatus: string; // "OPEN" | "IN_PROGRESS" | "COMPLETED" ...
  onClose: () => void;
  onReloadList?: () => void | Promise<void>;
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

  if (Number(form.rewardPoint) !== Number(original.rewardPoint)) body.rewardPoint = Number(form.rewardPoint);
  if (Number(form.recognizedHours) !== Number(original.recognizedHours)) body.recognizedHours = Number(form.recognizedHours);

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
  onReloadList,
}: Props) {
  const t = useI18n("extraCurricular.adminOfferingDetail.sessionDetailPanel");
  const tStatus = useI18n("extraCurricular.status.session");
  const { state, actions } = useExtraSessionDetail(offeringId, sessionId, true);

  // ✅ 수정은 offeringStatus === "IN_PROGRESS" 일 때만
  const isEditable = offeringStatus === "IN_PROGRESS";
  const editDisabledReason = !isEditable ? t("messages.editDisabledReason") : "";

  // ✅ 상태변경은 offeringStatus === "IN_PROGRESS" 일 때만
  const isStatusChangeable = offeringStatus === "IN_PROGRESS";
  const statusDisabledReason = !isStatusChangeable
    ? t("messages.statusChangeDisabledReason")
    : "";

  // ✅ 슬라이드 닫힘
  const [closing, setClosing] = useState(false);
  const requestClose = () => {
    setClosing(true);
    window.setTimeout(() => onClose(), 420);
  };

  const data = state.data;
  const previewUrl = data?.video?.previewUrl ?? "";

  // ✅ 세션 상태 드롭다운
  const [sessionStatus, setSessionStatus] = useState<string>("");
  const [changingStatus, setChangingStatus] = useState(false);

  // ✅ 취소 ConfirmDialog
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [pendingNextStatus, setPendingNextStatus] = useState<ExtraSessionStatus | null>(null);

  // 재생 상태
  const [showPlayer, setShowPlayer] = useState(false);

  // 편집 모드
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // DatePicker popover 닫기
  const [closeSignal, setCloseSignal] = useState(0);

  // form state
  const [sessionName, setSessionName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rewardPoint, setRewardPoint] = useState<number>(0);
  const [recognizedHours, setRecognizedHours] = useState<number>(0);
  const [videoTitle, setVideoTitle] = useState("");

  // 영상 교체 pending
  const [pendingVideo, setPendingVideo] = useState<PendingVideo | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // data 들어오면 form 초기화 + status 초기화
  useEffect(() => {
    if (!data) return;

    setSessionName(data.sessionName ?? "");
    setStartDate(isoToDateOnly(data.startAt));
    setEndDate(isoToDateOnly(data.endAt));
    setRewardPoint(Number(data.rewardPoint ?? 0));
    setRecognizedHours(Number(data.recognizedHours ?? 0));
    setVideoTitle(data.video?.title ?? "");

    setSessionStatus((data as any).status ?? "");
  }, [data?.sessionId]);

  const canPlay = useMemo(() => {
    return !!previewUrl && !state.loading && !state.error;
  }, [previewUrl, state.loading, state.error]);

  const statusOptions: DropdownOption[] = useMemo(
    () => [
      { value: "OPEN", label: `OPEN(${tStatus("OPEN")})` },
      { value: "CLOSED", label: `CLOSED(${tStatus("CLOSED")})` },
      { value: "CANCELED", label: `CANCELED(${tStatus("CANCELED")})` },
    ],
    [tStatus]
  );

  // ✅ 상태 변경 가능 조건 (IN_PROGRESS + 기타 충돌 방지)
  const canChangeStatus =
    isStatusChangeable &&
    !!data &&
    !editing &&
    !saving &&
    !uploadingVideo &&
    !changingStatus &&
    !state.loading &&
    !state.error;

  const doChangeStatus = async (target: ExtraSessionStatus) => {
    if (!data) return;

    // 이중 방어
    if (!isStatusChangeable) {
      toast.error(statusDisabledReason);
      return;
    }

    try {
      setChangingStatus(true);

      await changeExtraSessionStatus(offeringId, sessionId, {
        targetStatus: target,
      });

      toast.success(t("messages.statusChanged"));
      setSessionStatus(target);

      await actions.reload();
      await onReloadList?.();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.error?.message ?? e?.message ?? t("messages.statusChangeFailed"));
      setSessionStatus((data as any).status ?? "");
    } finally {
      setChangingStatus(false);
    }
  };

  const handleChangeStatus = async (nextValue: string) => {
    if (!data) return;
    if (!nextValue) return;
    if (nextValue === sessionStatus) return;

    // 이중 방어
    if (!isStatusChangeable) {
      toast.error(statusDisabledReason);
      return;
    }

    // ✅ 취소는 ConfirmDialog
    if (nextValue === "CANCELED") {
      setPendingNextStatus("CANCELED");
      setCancelConfirmOpen(true);
      return;
    }

    await doChangeStatus(nextValue as ExtraSessionStatus);
  };

  const openEdit = () => {
    if (!data) return;
    if (!isEditable) {
      toast.error(editDisabledReason);
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
    if (!sessionName.trim()) return t("messages.requiredSessionName");
    if (!startDate) return t("messages.requiredStartDate");
    if (!endDate) return t("messages.requiredEndDate");
    if (startDate > endDate) return t("messages.invalidDateRange");
    if (rewardPoint < 0) return t("messages.invalidRewardPoint");
    if (recognizedHours < 0) return t("messages.invalidRecognizedHours");
    if (uploadingVideo) return t("messages.waitUpload");
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

      const localPreviewUrl = URL.createObjectURL(f);

      setPendingVideo((prev) => {
        if (prev?.localPreviewUrl) URL.revokeObjectURL(prev.localPreviewUrl);
        return prev;
      });

      setPendingVideo({
        file: f,
        localPreviewUrl,
        storageKey,
        title: f.name,
        durationSeconds: dur,
      });

      toast.success(t("messages.uploadSuccess"));
    } catch (e: any) {
      console.error(e);
      toast.error(e?.error?.message ?? e?.message ?? t("messages.uploadFailed"));
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
    if (!isEditable) {
      toast.error(editDisabledReason);
      return;
    }

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
      toast(t("messages.noChanges"));
      setEditing(false);
      return;
    }

    try {
      setSaving(true);
      await updateExtraSession(offeringId, sessionId, patchBody);

      toast.success(t("messages.updateSuccess"));
      setCloseSignal((v) => v + 1);
      setEditing(false);

      if (pendingVideo?.localPreviewUrl) URL.revokeObjectURL(pendingVideo.localPreviewUrl);
      setPendingVideo(null);

      await actions.reload();
      await onReloadList?.();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.error?.message ?? e?.message ?? t("messages.updateFailed"));
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
                data?.sessionName ?? t("labels.sessionFallback")
              )}
            </div>

            {data && (
              <div className={styles.period}>
                <span className={styles.periodLabel}>{t("labels.watchPeriod")}</span>
                <span className={styles.periodValue}>
                  {formatIsoToYmdHm(data.startAt)} ~ {formatIsoToYmdHm(data.endAt)}
                </span>
              </div>
            )}
          </div>

          <div className={styles.topRight}>
            <div
              className={styles.statusSelect}
              title={!canChangeStatus ? statusDisabledReason : t("labels.changeSessionStatus")}
            >
              <Dropdown
                value={sessionStatus}
                options={statusOptions}
                placeholder={t("labels.status")}
                disabled={!canChangeStatus}
                loading={changingStatus}
                clearable={false}
                onChange={handleChangeStatus}
              />
            </div>

            <button
              type="button"
              className={styles.collapseBtn}
              onClick={() => {
                setCloseSignal((v) => v + 1);
                requestClose();
              }}
              aria-label={t("labels.collapse")}
              title={t("labels.collapse")}
            >
              <span className={styles.arrowUp}>⌃</span>
            </button>
          </div>
        </div>

        {state.loading && <div className={styles.msg}>{t("messages.loading")}</div>}
        {state.error && <div className={styles.error}>{state.error}</div>}

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
                    {canPlay ? t("messages.clickToPlay") : t("messages.cannotPlay")}
                  </div>
                </button>
              ) : (
                <video
                  src={playerSrc}
                  controls
                  controlsList="nodownload noplaybackrate noremoteplayback"
                  disablePictureInPicture
                  playsInline
                  preload="metadata"
                  onContextMenu={(e) => e.preventDefault()}
                  className={styles.video}
                />
              )}
            </div>
          </div>
        </div>

        {data && (
          <div className={styles.bottom}>
            <div className={styles.metaTop}>
              <span className={styles.videoLabel}>{t("labels.video")}</span>
              <span className={styles.videoTitle}>
                {pendingVideo ? pendingVideo.title : (data.video?.title ?? "-")}
                {pendingVideo ? <span className={styles.pendingBadge}>{t("labels.pendingReplace")}</span> : null}
              </span>
            </div>

            {editing ? (
              <div className={styles.editGrid}>
                <div className={styles.editRow2}>
                  <div className={styles.field}>
                    <div className={styles.label}>{t("fields.startDate")}</div>
                    <DatePickerInput
                      value={startDate}
                      onChange={(v) => {
                        setStartDate(v);
                        if (endDate && v > endDate) setEndDate("");
                      }}
                      placeholder={t("placeholders.startDate")}
                      closeSignal={closeSignal}
                    />
                  </div>

                  <div className={styles.field}>
                    <div className={styles.label}>{t("fields.endDate")}</div>
                    <DatePickerInput
                      value={endDate}
                      onChange={setEndDate}
                      placeholder={t("placeholders.endDate")}
                      min={startDate || undefined}
                      closeSignal={closeSignal}
                    />
                  </div>
                </div>

                <div className={styles.editRow2}>
                  <label className={styles.field}>
                    <div className={styles.label}>{t("fields.rewardPoint")}</div>
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
                    <div className={styles.label}>{t("fields.recognizedHours")}</div>
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
                  <div className={styles.label}>{t("fields.videoTitle")}</div>
                  <input
                    className={styles.control}
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    disabled={saving}
                  />
                </label>

                <div className={styles.replaceBlock}>
                  <div className={styles.replaceHead}>
                    <div className={styles.replaceTitle}>{t("replace.title")}</div>
                    <div className={styles.replaceHint}>
                      {t("replace.hint")}
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
                        {uploadingVideo ? t("dropzone.uploading") : t("dropzone.dragAndDropNewVideo")}
                      </div>
                      <div className={styles.dropSub}>
                        {pendingVideo
                          ? `${pendingVideo.file.name} · ${pendingVideo.durationSeconds}s`
                          : t("dropzone.selectWithButton")}
                      </div>

                      <div className={styles.dropActions}>
                        <button
                          type="button"
                          className={styles.pickBtn}
                          onClick={openFileDialog}
                          disabled={uploadingVideo || saving}
                        >
                          {t("buttons.pickFile")}
                        </button>

                        {pendingVideo && (
                          <button
                            type="button"
                            className={styles.clearBtn}
                            onClick={() => {
                              if (pendingVideo.localPreviewUrl) URL.revokeObjectURL(pendingVideo.localPreviewUrl);
                              setPendingVideo(null);
                              toast(t("messages.pendingCanceled"));
                            }}
                            disabled={uploadingVideo || saving}
                          >
                            {t("buttons.cancel")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button className={styles.btnPrimary} onClick={handleSave} disabled={saving || uploadingVideo}>
                    {saving ? t("buttons.saving") : t("buttons.save")}
                  </button>
                  <button className={styles.btnSecondary} onClick={cancelEdit} disabled={saving || uploadingVideo}>
                    {t("buttons.cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.metaRow}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaK}>{t("fields.rewardPoint")}</span>
                    <span className={styles.metaV}>{data.rewardPoint}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaK}>{t("fields.recognizedHours")}</span>
                    <span className={styles.metaV}>{data.recognizedHours}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaK}>{t("labels.videoDuration")}</span>
                    <span className={styles.metaV}>{data.video?.durationSeconds ?? 0}s</span>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    className={`${styles.btnSecondary} ${!isEditable ? styles.btnDisabled : ""}`}
                    onClick={openEdit}
                    disabled={!data || !isEditable}
                    title={!isEditable ? editDisabledReason : t("buttons.edit")}
                  >
                    {t("buttons.edit")}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ✅ CANCELED confirm */}
        <ConfirmDialog
          open={cancelConfirmOpen}
          title={t("cancelDialog.title")}
          description={
            <>
              {t("cancelDialog.descriptionLine1")}
              <br />
              {t("cancelDialog.descriptionLine2")}
            </>
          }
          confirmText={t("cancelDialog.confirmText")}
          cancelText={t("cancelDialog.cancelText")}
          danger
          loading={changingStatus}
          onCancel={() => {
            setCancelConfirmOpen(false);
            setPendingNextStatus(null);
          }}
          onConfirm={async () => {
            const target = pendingNextStatus;
            setCancelConfirmOpen(false);
            setPendingNextStatus(null);
            if (!target) return;
            await doChangeStatus(target);
          }}
        />
      </div>
    </div>
  );
}
