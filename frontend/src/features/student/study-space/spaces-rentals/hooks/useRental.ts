"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { rentalsApi } from "../api/rentalsApi";
import type {
  AuthMeDto,
  RentalDto,
  RentalListParams,
  PageMeta,
  RentalRawDto,
} from "../api/types";
import toast from "react-hot-toast";

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

/** raw 응답을 화면용 평탄 구조로 변환 */
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

      // cleaned comment
      const normalized = listRaw.map(normalizeRental);

      // cleaned comment
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

  const updateParams = useCallback((newParams: Partial<RentalListParams>) => {
    setParams((prev) => {
      const next = { ...prev, ...newParams };
      if (next.page === prev.page && next.size === prev.size) {
        return prev;
      }
      return next;
    });
  }, []);

  const cancelRental = async (rentalId: number) => {
    try {
      await rentalsApi.cancel(rentalId);
      toast.success("예약이 취소되었습니다.");
      fetchList();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.status ? `취소 중 오류가 발생했습니다. (HTTP ${e.status})` : "취소 중 오류가 발생했습니다.");
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
