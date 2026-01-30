"use client";

import * as React from "react";
import { fetchDeptCurricularDropdown } from "./api";
import type { SelectOption } from "./types";

export type UseDeptCurricularDropdownOptionsResult = {
  options: SelectOption[];
  loading: boolean;
  error: unknown;
  reload: () => Promise<void>;
};

/**
 * 학과 선택 → 해당 학과의 교과 드롭다운
 */
export function useDeptCurricularDropdownOptions(
  deptId?: number
): UseDeptCurricularDropdownOptionsResult {
  const [options, setOptions] = React.useState<SelectOption[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<unknown>(null);

  const reload = React.useCallback(async () => {
    if (!deptId) {
      // 학과 미선택 시 초기화
      setOptions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetchDeptCurricularDropdown(deptId);
      const next = (res.data ?? []).map((c) => ({
        value: String(c.curricularId),
        label: c.curricularName,
      }));
      setOptions(next);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [deptId]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  return { options, loading, error, reload };
}
