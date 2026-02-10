"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./SpacesModal.module.css";
import { Button } from "@/components/button";
import { roomsApi } from "../../api/SpacesApi";
import type { RoomDto } from "../../api/types";
import toast from "react-hot-toast";
import ReserveConfirmModal from "./ReserveConfirmModal.client";

type Props = {
  open: boolean;
  onClose: () => void;
  spaceId: number;
};

function todayYmd() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isValidYmd(v: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}
function isValidHm(v: string) {
  return /^\d{2}:\d{2}$/.test(v);
}
function compareStr(a: string, b: string) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/** HH:mm -> minutes */
function hmToMin(hm: string) {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}
/** minutes -> HH:mm */
function minToHm(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

type TimePoint = { value: string; label: string };

/**
 * ✅ 운영시간(availableStartTime~availableEndTime) 범위에서
 * "선택 가능한 시각 포인트"를 생성 (기본 2시간 단위)
 * 예: 09:00, 11:00, 13:00, ...
 */
function buildTimePoints(room: RoomDto, stepMin = 120): TimePoint[] {
  const s = room.availableStartTime;
  const e = room.availableEndTime;
  if (!isValidHm(s) || !isValidHm(e)) return [];

  const startMin = hmToMin(s);
  const endMin = hmToMin(e);
  if (startMin >= endMin) return [];

  const points: TimePoint[] = [];
  for (let t = startMin; t <= endMin; t += stepMin) {
    points.push({ value: minToHm(t), label: minToHm(t) });
  }

  // step 간격이 딱 안 맞아도 마지막 endTime 포함되도록 보정
  const endHm = minToHm(endMin);
  if (points[points.length - 1]?.value !== endHm) {
    points.push({ value: endHm, label: endHm });
  }

  // 중복 제거(안전)
  const uniq: TimePoint[] = [];
  const seen = new Set<string>();
  for (const p of points) {
    if (seen.has(p.value)) continue;
    seen.add(p.value);
    uniq.push(p);
  }
  return uniq;
}

export default function SpacesModal({ open, onClose, spaceId }: Props) {
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingRoomId, setSubmittingRoomId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{
    room: RoomDto;
    rentalDate: string;
    startTime: string;
    endTime: string;
  } | null>(null);

  // ✅ roomId -> selected date / start / end
  const [selectedDate, setSelectedDate] = useState<Record<number, string>>({});
  const [selectedStartTime, setSelectedStartTime] = useState<Record<number, string>>({});
  const [selectedEndTime, setSelectedEndTime] = useState<Record<number, string>>({});

  const dialogRef = useRef<HTMLDivElement | null>(null);

  /** open 시 룸 목록 로드 */
  useEffect(() => {
    if (!open) return;

    let alive = true;
    setLoading(true);

    (async () => {
      try {
        const res = await roomsApi.list(spaceId);
        const list = Array.isArray(res?.data) ? res.data : [];
        if (!alive) return;
        setRooms(list);

        // ✅ 기본값 초기화
        const t = todayYmd();
        const baseDate: Record<number, string> = {};
        const baseStart: Record<number, string> = {};
        const baseEnd: Record<number, string> = {};

        for (const r of list) {
          baseDate[r.roomId] = isValidYmd(t) ? t : "";
          baseStart[r.roomId] = "";
          baseEnd[r.roomId] = "";
        }

        setSelectedDate(baseDate);
        setSelectedStartTime(baseStart);
        setSelectedEndTime(baseEnd);
      } catch (e: any) {
        console.error("[ReserveModal list]", e);
        if (!alive) return;
        setRooms([]);
        alert(e?.message || "스터디룸 목록을 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    setTimeout(() => dialogRef.current?.focus(), 0);
    return () => {
      alive = false;
    };
  }, [open, spaceId]);

  /** ESC 닫기 */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onPickDate = (roomId: number, v: string) => {
    setSelectedDate((prev) => ({ ...prev, [roomId]: v }));
    // 날짜 바꾸면 시간 선택 초기화
    setSelectedStartTime((prev) => ({ ...prev, [roomId]: "" }));
    setSelectedEndTime((prev) => ({ ...prev, [roomId]: "" }));
  };

  const onPickStart = (roomId: number, v: string) => {
    setSelectedStartTime((prev) => ({ ...prev, [roomId]: v }));
    // 시작 시간 바꾸면 종료는 다시 선택
    setSelectedEndTime((prev) => ({ ...prev, [roomId]: "" }));
  };

  const onPickEnd = (roomId: number, v: string) => {
    setSelectedEndTime((prev) => ({ ...prev, [roomId]: v }));
  };

  const canReserve = (roomId: number) => {
    const d = selectedDate[roomId] ?? "";
    const s = selectedStartTime[roomId] ?? "";
    const e = selectedEndTime[roomId] ?? "";
    return isValidYmd(d) && isValidHm(s) && isValidHm(e) && compareStr(s, e) < 0;
  };

  const onClickReserve = async (room: RoomDto) => {
    const roomId = room.roomId;
    const rentalDate = selectedDate[roomId] ?? "";
    const startTime = selectedStartTime[roomId] ?? "";
    const endTime = selectedEndTime[roomId] ?? "";

    if (!isValidYmd(rentalDate)) return alert("예약 날짜를 선택하세요.");
    if (!isValidHm(startTime) || !isValidHm(endTime)) return alert("시작/종료 시간을 선택하세요.");
    if (compareStr(startTime, endTime) >= 0) return alert("종료 시간은 시작 시간보다 늦어야 합니다.");

    // ✅ 운영기간 체크
    if (room.operationStartDate && compareStr(rentalDate, room.operationStartDate) < 0) {
      return alert("운영 시작일 이전에는 예약할 수 없습니다.");
    }
    if (room.operationEndDate && compareStr(rentalDate, room.operationEndDate) > 0) {
      return alert("운영 종료일 이후에는 예약할 수 없습니다.");
    }

    // ✅ 운영시간 체크
    if (compareStr(startTime, room.availableStartTime) < 0 || compareStr(endTime, room.availableEndTime) > 0) {
      return alert("운영시간 범위 내에서만 예약할 수 있습니다.");
    }

    setConfirmTarget({ room, rentalDate, startTime, endTime });
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (submittingRoomId) return;
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  const confirmReserve = async () => {
    if (!confirmTarget) return;
    const { room, rentalDate, startTime, endTime } = confirmTarget;

    try {
      setSubmittingRoomId(room.roomId);

      await roomsApi.reserve(spaceId, {
        roomId: room.roomId,
        rentalDate,
        startTime,
        endTime,
      });

      toast.success("신청되었습니다.");
      setConfirmOpen(false);
      setConfirmTarget(null);
      onClose();
    } catch (e: any) {
      console.error("[ReserveModal create]", e);
      alert(e?.message || "예약 신청 중 오류가 발생했습니다.");
    } finally {
      setSubmittingRoomId(null);
    }
  };

  const rowsView = useMemo(() => {
    return rooms.map((room) => {
      const points = buildTimePoints(room, 120); // ✅ 2시간 단위(원하면 60/30으로 변경)
      const date = selectedDate[room.roomId] ?? todayYmd();
      const start = selectedStartTime[room.roomId] ?? "";
      const end = selectedEndTime[room.roomId] ?? "";
      return { room, points, date, start, end };
    });
  }, [rooms, selectedDate, selectedStartTime, selectedEndTime]);

  if (!open) return null;

  return (
    <>
      <div className={styles.overlay} onMouseDown={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        ref={dialogRef}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.topBar}>
          <div className={styles.subtitle}>예약하기</div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="close">
            ×
          </button>
        </div>

        <div className={styles.header}>
          <div className={styles.title}>예약하기</div>
          <div className={styles.spaceHint}>spaceId: {spaceId}</div>
        </div>

        <div className={styles.gridHeader}>
          <div className={styles.colName}>스터디룸</div>
          <div className={styles.colPeople}>수용 인원</div>
          <div className={styles.colPeriod}>날짜</div>
          <div className={styles.colTime}>시간</div>
          <div className={styles.colActions}></div>
        </div>

        <div className={styles.body}>
          <div className={styles.rowsCol}>
            {loading ? (
              <div className={styles.empty}>불러오는 중...</div>
            ) : rooms.length === 0 ? (
              <div className={styles.empty}>예약 가능한 스터디룸이 없습니다.</div>
            ) : (
              rowsView.map(({ room, points, date, start, end }) => {
                const startOptions = points.slice(0, Math.max(0, points.length - 1)); // 마지막은 종료전용
                const endOptions = start ? points.filter((p) => compareStr(p.value, start) > 0) : [];

                return (
                  <div key={room.roomId} className={styles.row}>
                    {/* 1) 스터디룸 */}
                    <div className={styles.cellName}>
                      <div className={styles.nameText}>{room.roomName}</div>
                    </div>

                    {/* 2) 수용 인원 */}
                    <div className={styles.cellPeople}>
                      <div className={styles.peopleWrap}>
                        <span className={styles.nameText}>
                          {room.minPeople} - {room.maxPeople}
                        </span>
                      </div>
                    </div>

                    {/* 3) 날짜 */}
                    <div className={styles.cellPeriod}>
                      <input
                        className={styles.dateInput}
                        type="date"
                        value={date}
                        min={room.operationStartDate || undefined}
                        max={room.operationEndDate || undefined}
                        onChange={(e) => onPickDate(room.roomId, e.target.value)}
                      />
                    </div>

                    {/* 4) 시간 (시작/종료) */}
                    <div className={styles.cellTime}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <select
                          className={styles.select}
                          value={start}
                          onChange={(e) => onPickStart(room.roomId, e.target.value)}
                        >
                          <option value="">시작 시간</option>
                          {startOptions.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>

                        <span className={styles.sep}>~</span>

                        <select
                          className={styles.select}
                          value={end}
                          disabled={!start}
                          onChange={(e) => onPickEnd(room.roomId, e.target.value)}
                        >
                          <option value="">{start ? "종료 시간" : "시작 먼저 선택"}</option>
                          {endOptions.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 5) 신청 */}
                    <div className={styles.cellActions}>
                      <Button
                        variant="primary"
                        onClick={() => onClickReserve(room)}
                        disabled={!canReserve(room.roomId) || submittingRoomId === room.roomId}
                      >
                        {submittingRoomId === room.roomId ? "신청 중..." : "신청"}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      </div>

      <ReserveConfirmModal
        open={confirmOpen}
        roomName={confirmTarget?.room.roomName}
        rentalDate={confirmTarget?.rentalDate}
        startTime={confirmTarget?.startTime}
        endTime={confirmTarget?.endTime}
        loading={submittingRoomId != null}
        onClose={closeConfirm}
        onConfirm={confirmReserve}
      />
    </>
  );
}
