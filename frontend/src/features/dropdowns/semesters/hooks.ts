"use client";

import * as React from "react";
import { fetchSemestersDropdown } from "./api";
import type { SelectOption } from "./types";

export type UseSemetersDropdownOptionsResult = {
  options: SelectOption[];
  loading: boolean;
  error: unknown;
  reload: () => Promise<void>;
};

export function useSemestersDropdownOptions(): UseSemetersDropdownOptionsResult {
  const [options, setOptions] = React.useState<SelectOption[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<unknown>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchSemestersDropdown();
      const next = (res.data ?? []).map((d) => ({
        value: String(d.semesterId),
        label: d.displayName,
      }));
      setOptions(next);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // 최초 1회 로드
    void reload();
  }, [reload]);

  return { options, loading, error, reload };
}
