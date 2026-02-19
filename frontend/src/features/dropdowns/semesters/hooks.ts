"use client";

import * as React from "react";
import { fetchSemestersDropdown } from "./api";
import type { SelectOption, SemesterItem } from "./types";
import { useLocale } from "@/hooks/useLocale";
import { localizeSemesterOptionLabel } from "./localeLabel";

export type UseSemetersDropdownOptionsResult = {
  options: SelectOption[];
  loading: boolean;
  error: unknown;
  reload: () => Promise<void>;
};

export function useSemestersDropdownOptions(): UseSemetersDropdownOptionsResult {
  const { locale } = useLocale();
  const [items, setItems] = React.useState<SemesterItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<unknown>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchSemestersDropdown();
      setItems(res.data ?? []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const options = React.useMemo<SelectOption[]>(
    () =>
      items.map((d) => ({
        value: String(d.semesterId),
        label: localizeSemesterOptionLabel(d.displayName, locale),
      })),
    [items, locale]
  );

  React.useEffect(() => {
    // 최초 1회 로드
    void reload();
  }, [reload]);

  return { options, loading, error, reload };
}
