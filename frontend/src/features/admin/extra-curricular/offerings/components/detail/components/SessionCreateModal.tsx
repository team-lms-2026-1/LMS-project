"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";

import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button";
import styles from "./SessionCreateModal.module.css";

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
    if (!sessionName.trim()) return "회차명을 입력하세요.";
    if (!startDate) return "시작일을 선택하세요.";
    if (!endDate) return "종료일을 선택하세요.";
    if (startDate > endDate) return "시작일은 종료일보다 늦을 수 없습니다.";

    if (rewardPoint < 0) return "포인트는 0 이상이어야 합니다.";
    if (recognizedHours < 0) return "인정시간은 0 이상이어야 합니다.";

    if (!file) return "동영상 파일을 업로드하세요.";
    if (!videoTitle.trim()) return "동영상 제목을 입력하세요.";
    if (!durationSeconds || durationSeconds < 1)
      return "동영상 길이를 읽지 못했습니다. 파일을 다시 선택해 주세요.";

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
    return reason ?? "파일을 업로드할 수 없습니다.";
  }, [fileRejections]);

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

      toast.success("회차가 생성되었습니다.");
      await onCreated?.();

      // ✅ 성공 후 popover 닫기
      setCloseSignal((v) => v + 1);
      onClose();
    } catch (e: any) {
      console.error(e);
      setError(e?.error?.message ?? e?.message ?? "회차 생성에 실패했습니다.");
      toast.error("회차 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="회차 생성"
      onClose={handleClose}
      size="lg"
      footer={
        <>
          <Button onClick={handleSubmit} disabled={!canSubmit} loading={loading}>
            생성
          </Button>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            취소
          </Button>
        </>
      }
    >
      {error ? <div className={styles.error}>{error}</div> : null}
      {rejectionMsg ? <div className={styles.error}>{rejectionMsg}</div> : null}

      <div className={styles.form}>
        {/* 2열: 회차명 / 포인트 */}
        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>회차명</div>
            <input
              className={styles.control}
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="예) 1회차"
              maxLength={100}
              autoComplete="off"
              disabled={loading}
            />
          </label>

          <label className={styles.field}>
            <div className={styles.label}>포인트</div>
            <input
              className={styles.control}
              type="number"
              value={rewardPoint === 0 ? "" : rewardPoint}
              onChange={(e) =>
                setRewardPoint(e.target.value === "" ? 0 : Number(e.target.value))
              }
              placeholder="예) 10"
              min={0}
              disabled={loading}
            />
          </label>
        </div>

        {/* 2열: 인정시간 / 재생시간(자동) */}
        <div className={styles.grid2}>
          <label className={styles.field}>
            <div className={styles.label}>인정시간</div>
            <input
              className={styles.control}
              type="number"
              value={recognizedHours === 0 ? "" : recognizedHours}
              onChange={(e) =>
                setRecognizedHours(
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
              placeholder="예) 2"
              min={0}
              disabled={loading}
            />
          </label>

          <div className={styles.field}>
            <div className={styles.label}>재생시간(초)</div>
            <input
              className={styles.control}
              value={durationSeconds ? String(durationSeconds) : ""}
              readOnly
              disabled
              placeholder="파일 선택 시 자동 입력"
            />

          </div>
        </div>

        <div className={styles.sectionTitle}>시청기간</div>

        {/* ✅ DatePickerInput (SemesterCreateModal 패턴 적용) */}
        <div className={styles.grid2}>
          <label className={styles.field}>
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
          </label>

          <label className={styles.field}>
            <div className={styles.label}>종료일</div>
            <DatePickerInput
              value={endDate}
              onChange={setEndDate}
              placeholder="종료일 선택"
              min={startDate || undefined}
              closeSignal={closeSignal}
            />
          </label>
        </div>

        <div className={styles.divider} />

        <div className={styles.sectionTitle}>동영상</div>

        <div className={styles.grid2}>
          {/* Dropzone */}
          <div className={styles.field}>
            <div className={styles.label}>동영상 파일</div>

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
                  {file ? "파일 선택됨" : "동영상을 드래그&드롭"}
                </div>
                <div className={styles.dropSub}>
                  {file
                    ? `${file.name} · ${(file.size / (1024 * 1024)).toFixed(1)}MB`
                    : "또는 아래 버튼으로 파일을 선택하세요."}
                </div>

                <div className={styles.dropActions}>
                  <button
                    type="button"
                    className={styles.pickBtn}
                    onClick={openFileDialog}
                    disabled={loading}
                  >
                    파일 선택
                  </button>

                  {file && (
                    <button
                      type="button"
                      className={styles.clearBtn}
                      onClick={() => onDrop([])}
                      disabled={loading}
                    >
                      제거
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* video title */}
          <label className={styles.field}>
            <div className={styles.label}>동영상 제목</div>
            <input
              className={styles.control}
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              maxLength={200}
              placeholder="예) 오리엔테이션 안내"
              disabled={loading}
            />
            <div className={styles.hint}>
              기본값은 파일명입니다. 필요하면 수정하세요.
            </div>
          </label>
        </div>
      </div>
    </Modal>
  );
}
