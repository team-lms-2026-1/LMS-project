"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { rentalsApi } from "../api/RentalsApi";
import type {
  AuthMeDto,
  RentalDto,
  RentalListParams,
  PageMeta,
  RentalRawDto,
} from "../api/types";

function normalizeMe(res: any): AuthMeDto | null {
  const d = res?.data ?? res;
  if (!d || typeof d.accountId !== "number") return null;

  return {
    accountId: d.accountId,
    loginId: String(d.loginId ?? ""),
    accountType: String(d.accountType ?? ""),
    permissionCodes: Array.isArray(d.permissionCodes) ? d.permissionCodes : [],
  };
}

/** ✅ raw -> 화면용 flat */
function normalizeRental(raw: RentalRawDto): RentalDto {
  return {
    rentalId: raw.rentalId,

    applicantAccountId: raw.applicant?.accountId,
    applicantName: raw.applicant?.name,
    applicantStudentNo: raw.applicant?.studentNo,
    applicantDepartment: raw.applicant?.department,

    spaceId: raw.space?.spaceId,
    spaceName: raw.space?.spaceName,

    roomId: raw.room?.roomId,
    roomName: raw.room?.roomName,

    date: raw.rentalDate,
    startTime: raw.startTime,
    endTime: raw.endTime,

    status: raw.status,
    requestAt: raw.requestAt,

    rejectionReason: raw.rejectionReason ?? null,
  };
}

export function useRental(initialParams: RentalListParams = { page: 1, size: 10 }) {
  const [me, setMe] = useState<AuthMeDto | null>(null);
  const [meLoading, setMeLoading] = useState(false);
  const [meError, setMeError] = useState("");

  const [data, setData] = useState<RentalDto[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [params, setParams] = useState<RentalListParams>(initialParams);

  const fetchMe = useCallback(async () => {
    setMeLoading(true);
    setMeError("");
    try {
      const res = await rentalsApi.me();
      const parsed = normalizeMe(res);
      setMe(parsed);
      if (!parsed) setMeError("내 정보를 불러오지 못했습니다.");
    } catch (e: any) {
      console.error(e);
      setMe(null);
      setMeError(e?.status ? `내 정보를 불러오지 못했습니다. (HTTP ${e.status})` : "내 정보를 불러오지 못했습니다.");
    } finally {
      setMeLoading(false);
    }
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await rentalsApi.list(params);

      const listRaw: RentalRawDto[] = Array.isArray(res?.data) ? res.data : [];

      // ✅ 1) raw를 먼저 flat으로 정규화
      const normalized = listRaw.map(normalizeRental);

      // ✅ 2) 내 것만 필터 (applicant.accountId 기반)
      const filtered =
        typeof me?.accountId === "number"
          ? normalized.filter((r) => r.applicantAccountId === me.accountId)
          : normalized;

      setData(filtered);
      setMeta(res?.meta ?? null);
    } catch (e: any) {
      console.error(e);
      setData([]);
      setMeta(null);
      setError(e?.status ? `목록을 불러오지 못했습니다. (HTTP ${e.status})` : "목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [params, me?.accountId]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (meLoading) return;
    fetchList();
  }, [fetchList, meLoading]);

  const updateParams = (newParams: Partial<RentalListParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const cancelRental = async (rentalId: number) => {
    if (!confirm("예약을 취소할까요?")) return;
    try {
      await rentalsApi.cancel(rentalId);
      alert("취소되었습니다.");
      fetchList();
    } catch (e: any) {
      console.error(e);
      alert(e?.status ? `취소 중 오류가 발생했습니다. (HTTP ${e.status})` : "취소 중 오류가 발생했습니다.");
    }
  };

  const fetchRejectionReason = async (r: RentalDto) => {
    if (r.rejectionReason) return r.rejectionReason;

    try {
      const res = await rentalsApi.detail(r.rentalId);
      const raw = res?.data;
      return raw?.rejectionReason ?? "";
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  const hasRentalRead = useMemo(() => {
    return me?.permissionCodes?.includes("RENTAL_READ") ?? true;
  }, [me?.permissionCodes]);

  return {
    me,
    meLoading,
    meError,
    hasRentalRead,

    data,
    meta,
    loading,
    error,
    params,
    updateParams,

    refresh: fetchList,
    cancelRental,
    fetchRejectionReason,
  };
}
