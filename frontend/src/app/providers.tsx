// src/app/providers.tsx
"use client";

import React from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/features/auth/AuthProvider"; // 경로 맞춰

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-center" />
    </AuthProvider>
  );
}
