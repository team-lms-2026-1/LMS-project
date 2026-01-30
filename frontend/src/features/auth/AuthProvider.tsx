"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ApiResponse, AuthMeDto } from "./types";
import { getJson } from "@/lib/http"; // ✅ 너희 getJson 경로로 맞춰

type AuthState = {
  me: AuthMeDto | null;
  loading: boolean;
  error: string | null;
};

type AuthActions = {
  reloadMe: () => Promise<void>;
  clearMe: () => void;
  hasPermission: (code: string) => boolean;
};

type AuthContextValue = {
  state: AuthState;
  actions: AuthActions;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMe(): Promise<AuthMeDto | null> {
  try {
    const res = await getJson<ApiResponse<AuthMeDto>>("/api/auth/me");
    return res.data;
  } catch (e: any) {
    // ✅ 미로그인/만료면 me=null 로만 처리 (에러로 띄우지 않음)
    if (e?.status === 401) return null;
    throw e;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<AuthMeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reloadMe = async () => {
    setLoading(true);
    setError(null);

    try {
      const nextMe = await fetchMe();
      setMe(nextMe);
    } catch (e: any) {
      console.error("[AuthProvider] reloadMe failed", e);
      setMe(null);
      setError(e?.message ?? "인증 정보 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  const clearMe = () => setMe(null);

  const hasPermission = (code: string) => {
    return Boolean(me?.permissionCodes?.includes(code));
  };

  useEffect(() => {
    void reloadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      state: { me, loading, error },
      actions: { reloadMe, clearMe, hasPermission },
    };
  }, [me, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
