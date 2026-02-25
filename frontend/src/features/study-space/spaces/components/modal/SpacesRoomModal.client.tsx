"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./SpacesRoomModal.module.css";
import { Button } from "@/components/button";
import { DatePickerInput } from "@/features/authority/semesters/components/ui/DatePickerInput";
import toast from "react-hot-toast";
import type {
  AdminRoomDto,
  CreateAdminRoomRequestDto,
  UpdateAdminRoomRequestDto,
} from "../../api/types";
import { roomsApi } from "../../api/spacesApi";
import { useI18n } from "@/i18n/useI18n";

type RoomRowState = {
  roomId?: number;
  name: string;

  minPeople: number;
  maxPeople: number;

  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm

  isEditing?: boolean;
  isNew?: boolean;
};

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

function normalizeRoom(r: Partial<RoomRowState>): RoomRowState {
  const t = todayYmd();
  return {
    roomId: r.roomId,
    name: r.name ?? "",
    minPeople: typeof r.minPeople === "number" ? r.minPeople : 1,
    maxPeople: typeof r.maxPeople === "number" ? r.maxPeople : 1,
    startDate: isValidYmd(r.startDate ?? "") ? (r.startDate as string) : t,
    endDate: isValidYmd(r.endDate ?? "") ? (r.endDate as string) : t,
    startTime: isValidHm(r.startTime ?? "") ? (r.startTime as string) : "10:00",
    endTime: isValidHm(r.endTime ?? "") ? (r.endTime as string) : "20:00",
    isEditing: r.isEditing ?? false,
    isNew: r.isNew ?? false,
  };
}

/** 백엔드 -> UI */
function fromBackend(dto: AdminRoomDto): RoomRowState {
  return normalizeRoom({
    roomId: dto.roomId,
    name: dto.roomName,
    minPeople: dto.minPeople,
    maxPeople: dto.maxPeople,
    startDate: dto.operationStartDate,
    endDate: dto.operationEndDate,
    startTime: dto.availableStartTime,
    endTime: dto.availableEndTime,
    isEditing: false,
    isNew: false,
  });
}

/** UI -> 백엔드 Create */
function toCreatePayload(r: RoomRowState): CreateAdminRoomRequestDto {
  return {
    roomName: r.name.trim(),
    minPeople: r.minPeople,
    maxPeople: r.maxPeople,
    description: "",

    operationStartDate: r.startDate,
    operationEndDate: r.endDate,
    availableStartTime: r.startTime,
    availableEndTime: r.endTime,
  };
}

/** UI -> 백엔드 Update */
function toUpdatePayload(r: RoomRowState): UpdateAdminRoomRequestDto {
  return {
    roomName: r.name.trim(),
    minPeople: r.minPeople,
    maxPeople: r.maxPeople,

    operationStartDate: r.startDate,
    operationEndDate: r.endDate,
    availableStartTime: r.startTime,
    availableEndTime: r.endTime,
  };
}

export default function SpacesRoomModal({ open, onClose, spaceId }: Props) {
  const t = useI18n("studySpace.admin.spaces.roomModal");
  const [rows, setRows] = useState<RoomRowState[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const dialogRef = useRef<HTMLDivElement | null>(null);

  /** ✅ open 시 목록 로드 */
  useEffect(() => {
    if (!open) return;

    let alive = true;
    setLoading(true);

    (async () => {
      try {
        const res = await roomsApi.list(spaceId);
        const list = Array.isArray(res?.data) ? res.data : [];
        if (!alive) return;
        setRows(list.map(fromBackend));
      } catch (e: any) {
        console.error("[RoomsModal list]", e);
        if (!alive) return;
        setRows([]);
        alert(e?.message || t("errors.listLoadFailed"));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    setTimeout(() => dialogRef.current?.focus(), 0);
    return () => {
      alive = false;
    };
  }, [open, spaceId, t]);

  /** ESC 닫기 */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const addRoom = () => {
    const base = normalizeRoom({
      isEditing: true,
      isNew: true,
      name: "",
      minPeople: 1,
      maxPeople: 1,
      startDate: todayYmd(),
      endDate: todayYmd(),
      startTime: "10:00",
      endTime: "20:00",
    });
    setRows((prev) => [...prev, base]);
  };

  const setField = <K extends keyof RoomRowState>(idx: number, key: K, value: RoomRowState[K]) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));
  };

  const enterEdit = (idx: number) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, isEditing: true } : r)));
  };

  const cancelEdit = (idx: number) => {
    setRows((prev) => {
      const t = prev[idx];
      if (!t) return prev;

      const isNewEmpty = t.isNew && (t.name ?? "").trim() === "";
      if (isNewEmpty) return prev.filter((_, i) => i !== idx);

      return prev.map((r, i) => (i === idx ? { ...r, isEditing: false } : r));
    });
  };

  const validateRow = (r: RoomRowState): string | null => {
    if (!r.name.trim()) return t("errors.nameRequired");
    if (!Number.isFinite(r.minPeople) || r.minPeople < 1) return t("errors.minPeopleInvalid");
    if (!Number.isFinite(r.maxPeople) || r.maxPeople < 1) return t("errors.maxPeopleInvalid");
    if (r.minPeople > r.maxPeople) return t("errors.minGreaterThanMax");

    if (!isValidYmd(r.startDate) || !isValidYmd(r.endDate)) return t("errors.invalidPeriodDate");
    if (compareStr(r.startDate, r.endDate) > 0) return t("errors.periodOrderInvalid");

    if (!isValidHm(r.startTime) || !isValidHm(r.endTime)) return t("errors.invalidTimeFormat");
    if (compareStr(r.startTime, r.endTime) >= 0) return t("errors.timeOrderInvalid");

    return null;
  };

  const reloadRows = async () => {
    const res = await roomsApi.list(spaceId);
    const list = Array.isArray(res?.data) ? res.data : [];
    setRows(list.map(fromBackend));
  };

  /** ✅ 저장: 신규(POST) / 기존(PATCH) */

  const saveRow = async (idx: number) => {
    const r = rows[idx];
    if (!r) return;

    const msg = validateRow(r);
    if (msg) return alert(msg);

    try {
      setSaving(true);
      const isCreate = !r.roomId;

      // ✅ 1) UI 먼저 편집 종료 + isNew 해제 (사용자 체감 개선)
      setRows(prev =>
        prev.map((x, i) =>
          i === idx ? { ...x, isEditing: false, isNew: false } : x
        )
      );

      // ✅ 2) 서버 저장
      let savedData: AdminRoomDto;
      if (!r.roomId) {
        const res = await roomsApi.create(spaceId, toCreatePayload(r));
        savedData = res.data;
      } else {
        const res = await roomsApi.update(spaceId, r.roomId, toUpdatePayload(r));
        savedData = res.data;
      }

      // ✅ 3) 로컬 상태 업데이트
      console.log("savedData Response:", savedData); // 디버깅용 로그

      setRows((prev) =>
        prev.map((row, i) => {
          if (i !== idx) return row;

          const newData = fromBackend(savedData);
          // ⚠️ 방어 코드: 서버 응답에 이름이 없으면 클라이언트 입력값 유지
          if (!newData.name || newData.name.trim() === "") {
            newData.name = row.name;
          }
          return newData;
        })
      );
      toast.success(isCreate ? t("toasts.created") : t("toasts.updated"));
    } catch (e: any) {
      console.error("[RoomsModal saveRow]", e);
      toast.error(e?.message || t("errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  /** ✅ 삭제: 기존이면 DELETE 호출 */
  const removeRow = async (idx: number) => {
    const r = rows[idx];
    if (!r) return;
    if (!confirm(t("confirmDelete"))) return;

    try {
      setSaving(true);

      if (r.roomId) {
        await roomsApi.remove(spaceId, r.roomId);
      }

      setRows((prev) => prev.filter((_, i) => i !== idx));
      toast.success(t("toasts.deleted"));
    } catch (e: any) {
      console.error("[RoomsModal removeRow]", e);
      toast.error(e?.message || t("errors.deleteFailed"));
    } finally {
      setSaving(false);
    }
  };

  const onClickDone = () => {
    const editing = rows.find((r) => r.isEditing);
    if (editing) {
      toast.error(t("errors.editingExists"));
      return;
    }
    onClose();
  };

  if (!open) return null;

  return (
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
          <div className={styles.subtitle}>{t("subtitle")}</div>
          <button className={styles.closeBtn} onClick={onClose} aria-label={t("closeAriaLabel")}>
            ×
          </button>
        </div>

        <div className={styles.header}>
          <div className={styles.title}>{t("title")}</div>
          <div className={styles.spaceHint}>{t("spaceHint", { spaceId })}</div>
        </div>

        <div className={styles.gridHeader}>
          <div className={styles.colName}>{t("columns.room")}</div>
          <div className={styles.colPeople}>{t("columns.people")}</div>
          <div className={styles.colPeriod}>{t("columns.period")}</div>
          <div className={styles.colTime}>{t("columns.time")}</div>
          <div className={styles.colActions}></div>
        </div>

        <div className={styles.body}>
          <div className={styles.rowsCol}>
            {loading ? (
              <div className={styles.empty}>{t("loading")}</div>
            ) : rows.length === 0 ? (
              <div className={styles.empty}>{t("empty")}</div>
            ) : (
              rows.map((r, idx) => (
                <div key={`${r.roomId ?? "new"}-${idx}`} className={styles.row}>
                  {/* 1) 이름 */}
                  <div className={styles.cellName}>
                    {r.isEditing ? (
                      <input
                        className={styles.nameInput}
                        value={r.name}
                        onChange={(e) => setField(idx, "name", e.target.value)}
                        placeholder={t("namePlaceholder")}
                      />
                    ) : (
                      <div className={styles.nameText}>{r.name}</div>
                    )}
                  </div>

                  {/* 2) 수용 인원 */}
                  <div className={styles.cellPeople}>
                    <div className={styles.peopleWrap}>
                      <select
                        className={styles.select}
                        value={String(r.minPeople)}
                        disabled={!r.isEditing}
                        onChange={(e) => setField(idx, "minPeople", Number(e.target.value))}
                      >
                        {Array.from({ length: 30 }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                      <span className={styles.sep}>-</span>
                      <select
                        className={styles.select}
                        value={String(r.maxPeople)}
                        disabled={!r.isEditing}
                        onChange={(e) => setField(idx, "maxPeople", Number(e.target.value))}
                      >
                        {Array.from({ length: 30 }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 3) 운영기간 */}
                  <div className={styles.cellPeriod}>
                    <div className={styles.periodWrap}>
                      <DatePickerInput
                        value={r.startDate}
                        onChange={(v) => setField(idx, "startDate", v)}
                        disabled={!r.isEditing}
                        max={r.endDate}
                        className={styles.dateInput}
                      />
                      <span className={styles.sep}>~</span>
                      <DatePickerInput
                        value={r.endDate}
                        onChange={(v) => setField(idx, "endDate", v)}
                        disabled={!r.isEditing}
                        min={r.startDate}
                        className={styles.dateInput}
                      />
                    </div>
                  </div>

                  {/* 4) 운영시간 */}
                  <div className={styles.cellTime}>
                    <div className={styles.timeWrap}>
                      <input
                        className={styles.timeInput}
                        type="time"
                        value={r.startTime}
                        disabled={!r.isEditing}
                        onChange={(e) => setField(idx, "startTime", e.target.value)}
                      />
                      <span className={styles.sep}>~</span>
                      <input
                        className={styles.timeInput}
                        type="time"
                        value={r.endTime}
                        disabled={!r.isEditing}
                        onChange={(e) => setField(idx, "endTime", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* 5) 액션 */}
                  <div className={styles.cellActions}>
                    {r.isEditing ? (
                      <div className={styles.actionStack}>
                        <Button variant="primary" onClick={() => saveRow(idx)} disabled={saving}>
                          {t("buttons.save")}
                        </Button>
                        <Button variant="secondary" onClick={() => cancelEdit(idx)} disabled={saving}>
                          {t("buttons.cancel")}
                        </Button>
                      </div>
                    ) : (
                      <div className={styles.actionStack}>
                        <Button variant="primary" onClick={() => enterEdit(idx)} disabled={saving}>
                          {t("buttons.edit")}
                        </Button>
                        <Button className={styles.dangerBtn} variant="danger" onClick={() => removeRow(idx)} disabled={saving}>
                          {t("buttons.delete")}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            <div className={styles.addRow}>
              <button type="button" className={styles.addBtn} onClick={addRoom} aria-label="add room">
                +
              </button>
              <div className={styles.addLabel}>{t("addLabel")}</div>
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <Button variant="primary" onClick={onClickDone} disabled={saving}>
            {saving ? t("buttons.processing") : t("buttons.done")}
          </Button>
        </div>
      </div>
    </div>
  );
}
