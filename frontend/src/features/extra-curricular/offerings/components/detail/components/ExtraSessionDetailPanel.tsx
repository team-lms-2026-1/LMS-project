"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";

import styles from "./ExtraSessionDetailPanel.module.css"

import { DatePickerInput } from "@/features/authority/semesters/components/ui/DatePickerInput";
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
  const { state, actions } = useExtraSessionDetail(offeringId, sessionId, true);

  // ✅ 수정은 offeringStatus === "OPEN" 일 때만
  const isEditable = offeringStatus === "OPEN";
  const editDisabledReason = !isEditable ? "운영 상태가 OPEN일 때만 수정할 수 있습니다." : "";

  // ✅ 상태변경은 offeringStatus === "IN_PROGRESS" 일 때만
  const isStatusChangeable = offeringStatus === "IN_PROGRESS";
  const statusDisabledReason = !isStatusChangeable
    ? "운영 상태가 IN_PROGRESS일 때만 세션 상태를 변경할 수 있습니다."
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
      { value: "OPEN", label: "OPEN(진행)" },
      { value: "CLOSED", label: "CLOSED(마감)" },
      { value: "CANCELED", label: "CANCELED(취소)" },
    ],
    []
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

      toast.success("세션 상태가 변경되었습니다.");
      setSessionStatus(target);

      await actions.reload();
      await onReloadList?.();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.error?.message ?? e?.message ?? "상태 변경 실패");
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
      await onReloadList?.();
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
                <span className={styles.periodValue}>
                  {formatIsoToYmdHm(data.startAt)} ~ {formatIsoToYmdHm(data.endAt)}
                </span>
              </div>
            )}
          </div>

          <div className={styles.topRight}>
            <div
              className={styles.statusSelect}
              title={!canChangeStatus ? statusDisabledReason : "세션 상태 변경"}
            >
              <Dropdown
                value={sessionStatus}
                options={statusOptions}
                placeholder="상태"
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
              aria-label="접기"
              title="접기"
            >
              <span className={styles.arrowUp}>⌃</span>
            </button>
          </div>
        </div>

        {state.loading && <div className={styles.msg}>불러오는 중...</div>}
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
                  aria-label="재생"
                >
                  <div className={styles.coverCenter}>
                    <span className={styles.playCircle}>
                      <span className={styles.playTriangle} />
                    </span>
                  </div>
                  <div className={styles.coverHint}>
                    {canPlay ? "클릭해서 재생" : "재생할 수 없습니다"}
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
              <span className={styles.videoLabel}>영상</span>
              <span className={styles.videoTitle}>
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
                      파일 업로드 후 <b>저장</b>을 눌러야 반영됩니다.
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
                      <div className={styles.dropSub}>
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
                              if (pendingVideo.localPreviewUrl) URL.revokeObjectURL(pendingVideo.localPreviewUrl);
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
                  <button className={styles.btnPrimary} onClick={handleSave} disabled={saving || uploadingVideo}>
                    {saving ? "저장 중..." : "저장"}
                  </button>
                  <button className={styles.btnSecondary} onClick={cancelEdit} disabled={saving || uploadingVideo}>
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
                    className={`${styles.btnSecondary} ${!isEditable ? styles.btnDisabled : ""}`}
                    onClick={openEdit}
                    disabled={!data || !isEditable}
                    title={!isEditable ? editDisabledReason : "수정"}
                  >
                    수정
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ✅ CANCELED confirm */}
        <ConfirmDialog
          open={cancelConfirmOpen}
          title="세션 취소"
          description={
            <>
              이 세션을 <b>CANCELED</b>로 변경할까요?
              <br />
              취소 처리 시 완료 이력이 정리될 수 있습니다.
            </>
          }
          confirmText="취소 처리"
          cancelText="닫기"
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
