"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";

import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import styles from "./SessionCreateModal.module.css";
import { useI18n } from "@/i18n/useI18n";

import type {
  ExtraCurricularSessionCreateRequest,
  ExtraSessionVideoPresignRequest,
} from "../../../api/types";

import {
  presignExtraSessionVideoUpload,
  createExtraCurricularSession,
} from "../../../api/extraCurricularOfferingApi";

import { uploadToS3PresignedUrl } from "../../../utils/s3Upload";

// ✅ SemesterCreateModal에서 쓰는 DatePickerInput과 "동일한 것"을 import 하자.
// 프로젝트 경로에 맞게 아래 import를 SemesterCreateModal과 동일하게 맞춰.
// (예: SemesterCreateModal이 "../ui/DatePickerInput" 이면 그 경로 그대로 사용)
import { DatePickerInput } from "@/features/admin/authority/semesters/components/ui/DatePickerInput";

type Props = {
  open: boolean;
  extraOfferingId: number;
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
};

function toStartIso(date: string) {
  if (!date) return "";
  return `${date}T00:00:00`;
}

function toEndIso(date: string) {
  if (!date) return "";
  return `${date}T23:59:59`;
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

export function SessionCreateModal({
  open,
  extraOfferingId,
  onClose,
  onCreated,
}: Props) {
  const t = useI18n("extraCurricular.adminOfferingDetail.sessionCreateModal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ DatePickerInput popover 강제 닫기 신호 (SemesterCreateModal 방식)
  const [closeSignal, setCloseSignal] = useState(0);

  // form
  const [sessionName, setSessionName] = useState("");
  const [rewardPoint, setRewardPoint] = useState<number>(0);
  const [recognizedHours, setRecognizedHours] = useState<number>(0);

  // ✅ 날짜만
  const [startDate, setStartDate] = useState<string>(""); // yyyy-mm-dd
  const [endDate, setEndDate] = useState<string>(""); // yyyy-mm-dd

  // video
  const [file, setFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [durationSeconds, setDurationSeconds] = useState<number>(0);

  useEffect(() => {
    if (!open) return;

    setLoading(false);
    setError(null);

    setSessionName("");
    setRewardPoint(0);
    setRecognizedHours(0);

    setStartDate("");
    setEndDate("");

    setFile(null);
    setVideoTitle("");
    setDurationSeconds(0);
  }, [open]);

  const startAtIso = useMemo(() => toStartIso(startDate), [startDate]);
  const endAtIso = useMemo(() => toEndIso(endDate), [endDate]);

  const validate = () => {
    if (!sessionName.trim()) return t("messages.requiredSessionName");
    if (!startDate) return t("messages.requiredStartDate");
    if (!endDate) return t("messages.requiredEndDate");
    if (startDate > endDate) return t("messages.invalidDateRange");

    if (rewardPoint < 0) return t("messages.invalidRewardPoint");
    if (recognizedHours < 0) return t("messages.invalidRecognizedHours");

    if (!file) return t("messages.requiredVideoFile");
    if (!videoTitle.trim()) return t("messages.requiredVideoTitle");
    if (!durationSeconds || durationSeconds < 1)
      return t("messages.invalidVideoDuration");

    return null;
  };

  const handleClose = () => {
    if (loading) return;
    // ✅ 모달 닫기 전에 popover 먼저 닫기
    setCloseSignal((v) => v + 1);
    onClose();
  };

  const onDrop = async (acceptedFiles: File[]) => {
    setError(null);

    const picked = acceptedFiles?.[0] ?? null;
    setFile(picked);

    if (!picked) {
      setVideoTitle("");
      setDurationSeconds(0);
      return;
    }

    // 기본 제목: 파일명
    setVideoTitle((prev) => (prev.trim() ? prev : picked.name));

    // duration 자동 (수정 불가)
    try {
      const dur = await readVideoDurationSeconds(picked);
      setDurationSeconds(dur);
    } catch {
      setDurationSeconds(1);
    }
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    fileRejections,
    open: openFileDialog,
  } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    accept: { "video/*": [] },
    disabled: loading,
    maxFiles: 1,
  });

  const rejectionMsg = useMemo(() => {
    if (!fileRejections?.length) return null;
    const first = fileRejections[0];
    const reason = first.errors?.[0]?.message;
    return reason ?? t("messages.fileUploadRejected");
  }, [fileRejections, t]);

  const canSubmit = useMemo(() => validate() === null && !loading, [
    sessionName,
    startDate,
    endDate,
    rewardPoint,
    recognizedHours,
    file,
    videoTitle,
    durationSeconds,
    loading,
  ]);

  const handleSubmit = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // 1) presign
      const presignReq: ExtraSessionVideoPresignRequest = {
        originalFileName: file.name,
        contentType: file.type || "video/mp4",
        contentLength: file.size,
      };

      const presignRes = await presignExtraSessionVideoUpload(
        extraOfferingId,
        presignReq
      );
      const { storageKey, uploadUrl } = presignRes.data;

      // 2) upload
      await uploadToS3PresignedUrl({
        uploadUrl,
        file,
        contentType: presignReq.contentType,
      });

      // 3) create
      const body: ExtraCurricularSessionCreateRequest = {
        sessionName: sessionName.trim(),
        startAt: startAtIso,
        endAt: endAtIso,
        rewardPoint: Number(rewardPoint),
        recognizedHours: Number(recognizedHours),
        video: {
          storageKey,
          title: videoTitle.trim(),
          durationSeconds: Number(durationSeconds),
        },
      };

      await createExtraCurricularSession(extraOfferingId, body);

      toast.success(t("messages.createSuccess"));
      await onCreated?.();

      // ✅ 성공 후 popover 닫기
      setCloseSignal((v) => v + 1);
      onClose();
    } catch (e: any) {
      console.error(e);
      const fallback = t("messages.createFailed");
      setError(e?.error?.message ?? e?.message ?? fallback);
      toast.error(fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={t("title")}
      onClose={handleClose}
      size="lg"
      footer={
        <>
          <Button onClick={handleSubmit} disabled={!canSubmit} loading={loading}>
            {t("buttons.create")}
          </Button>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            {t("buttons.cancel")}
          </Button>
        </>
      }
    >
      {error ? <div className={styles.error}>{error}</div> : null}
      {rejectionMsg ? <div className={styles.error}>{rejectionMsg}</div> : null}

      <div className={styles.form}>
        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>{t("fields.sessionName")}</div>
            <input
              className={styles.control}
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder={t("placeholders.sessionName")}
              maxLength={100}
              autoComplete="off"
              disabled={loading}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("fields.rewardPoint")}</div>
            <input
              className={styles.control}
              type="number"
              value={rewardPoint === 0 ? "" : rewardPoint}
              onChange={(e) =>
                setRewardPoint(e.target.value === "" ? 0 : Number(e.target.value))
              }
              placeholder={t("placeholders.rewardPoint")}
              min={0}
              disabled={loading}
            />
          </label>
        </div>

        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>{t("fields.recognizedHours")}</div>
            <input
              className={styles.control}
              type="number"
              value={recognizedHours === 0 ? "" : recognizedHours}
              onChange={(e) =>
                setRecognizedHours(
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
              placeholder={t("placeholders.recognizedHours")}
              min={0}
              disabled={loading}
            />
          </label>

          <div className={styles.field}>
            <div className={styles.label}>{t("fields.durationSeconds")}</div>
            <input
              className={styles.control}
              value={durationSeconds ? String(durationSeconds) : ""}
              readOnly
              disabled
              placeholder={t("placeholders.durationSeconds")}
            />
          </div>
        </div>

        <div className={styles.sectionTitle}>{t("sections.watchPeriod")}</div>

        <div className={styles.grid2}>
          <label className={styles.field}>
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
          </label>

          <label className={styles.field}>
            <div className={styles.label}>{t("fields.endDate")}</div>
            <DatePickerInput
              value={endDate}
              onChange={setEndDate}
              placeholder={t("placeholders.endDate")}
              min={startDate || undefined}
              closeSignal={closeSignal}
            />
          </label>
        </div>

        <div className={styles.divider} />

        <div className={styles.sectionTitle}>{t("sections.video")}</div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <div className={styles.label}>{t("fields.videoFile")}</div>

            <div
              {...getRootProps({
                className: `${styles.dropzone} ${
                  isDragActive ? styles.dropzoneActive : ""
                } ${loading ? styles.dropzoneDisabled : ""}`,
              })}
            >
              <input {...getInputProps()} />

              <div className={styles.dropzoneInner}>
                <div className={styles.dropTitle}>
                  {file ? t("dropzone.fileSelected") : t("dropzone.dragAndDrop")}
                </div>
                <div className={styles.dropSub}>
                  {file
                    ? `${file.name} · ${(file.size / (1024 * 1024)).toFixed(1)}MB`
                    : t("dropzone.selectWithButton")}
                </div>

                <div className={styles.dropActions}>
                  <button
                    type="button"
                    className={styles.pickBtn}
                    onClick={openFileDialog}
                    disabled={loading}
                  >
                    {t("buttons.pickFile")}
                  </button>

                  {file && (
                    <button
                      type="button"
                      className={styles.clearBtn}
                      onClick={() => onDrop([])}
                      disabled={loading}
                    >
                      {t("buttons.remove")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <label className={styles.field}>
            <div className={styles.label}>{t("fields.videoTitle")}</div>
            <input
              className={styles.control}
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              maxLength={200}
              placeholder={t("placeholders.videoTitle")}
              disabled={loading}
            />
            <div className={styles.hint}>{t("hints.videoTitle")}</div>
          </label>
        </div>
      </div>
    </Modal>
  );
}
