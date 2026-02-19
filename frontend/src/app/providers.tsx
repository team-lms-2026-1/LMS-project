// src/app/providers.tsx
"use client";

import React from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/features/auth/AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AuthProvider>
      {children}
      {mounted && <Toaster position="top-center" />}
    </AuthProvider>
  );
}
