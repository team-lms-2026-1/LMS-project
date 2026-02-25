<<<<<<< HEAD
﻿import { useEffect, useState, useCallback } from "react";
import { rentalsApi } from "../api/rentalsApi";
import type { RentalDto, RentalListParams, PageMeta } from "../api/types";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

export function useRentalsList(initialParams: RentalListParams = { page: 1, size: 10 }) {
  const t = useI18n("studySpace.admin.rentals.hook");
=======
﻿﻿"use client";

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
import { useI18n } from "@/i18n/useI18n";

type AccountMeResponse = {
  data?: {
    name?: string | null;
  } | null;
};

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

async function fetchProfileName(): Promise<string | null> {
  try {
    const res = await fetch("/api/accounts/me", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null;

    const json = (await res.json()) as AccountMeResponse;
    const name = json?.data?.name;
    if (typeof name !== "string") return null;

    const trimmed = name.trim();
    return trimmed.length ? trimmed : null;
  } catch {
    return null;
  }
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
  const t = useI18n("studySpace.student.rentals.hook");
  const [me, setMe] = useState<AuthMeDto | null>(null);
  const [meLoading, setMeLoading] = useState(false);
  const [meError, setMeError] = useState("");
  const [profileName, setProfileName] = useState("");

>>>>>>> ccf7365 (알람)
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
      if (!parsed) setMeError(t("errors.me"));
    } catch (e: any) {
      console.error(e);
      setMe(null);
      setMeError(e?.status ? t("errors.meWithStatus", { status: e.status }) : t("errors.me"));
    } finally {
      setMeLoading(false);
    }
  }, [t]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await rentalsApi.list(params);

      const listRaw: RentalRawDto[] = Array.isArray(res?.data) ? res.data : [];

<<<<<<< HEAD
      setData([]);
      setMeta(null);

      const msg = e?.status ? t("errors.listWithStatus", { status: e.status }) : t("errors.list");
      setError(msg);
=======
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
      setError(e?.status ? t("errors.listWithStatus", { status: e.status }) : t("errors.list"));
>>>>>>> ccf7365 (알람)
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
  }, [params, t]);
=======
  }, [params, me?.accountId, t]);
>>>>>>> ccf7365 (알람)

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    let active = true;
    fetchProfileName().then((name) => {
      if (!active || !name) return;
      setProfileName(name);
    });
    return () => {
      active = false;
    };
  }, []);

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
<<<<<<< HEAD
      await rentalsApi.approve(id);
      toast.success(t("toasts.approved"));
      fetchList();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.status ? t("errors.processWithStatus", { status: e.status }) : t("errors.process"));
=======
      await rentalsApi.cancel(rentalId);
      toast.success(t("toasts.cancelled"));
      fetchList();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.status ? t("errors.cancelWithStatus", { status: e.status }) : t("errors.cancel"));
>>>>>>> ccf7365 (알람)
    }
  };

  const fetchRejectionReason = async (r: RentalDto) => {
    if (r.rejectionReason) return r.rejectionReason;

    try {
<<<<<<< HEAD
      await rentalsApi.reject(id, reason);
      toast.success(t("toasts.rejected"));
      fetchList();
    } catch (e: any) {
      console.error(e);
      toast.error(t("errors.process"));
=======
      const res = await rentalsApi.detail(r.rentalId);
      const raw = res?.data;
      return raw?.rejectionReason ?? "";
    } catch (e) {
      console.error(e);
      return "";
>>>>>>> ccf7365 (알람)
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
    profileName,

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
