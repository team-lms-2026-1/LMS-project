"use client";

import * as React from "react";

import { fetchDeptProfessorDropdown } from "./api";
import type { DeptProfessorItem, SelectOption } from "./types";

export type UseDeptProfessorDropdownOptionsResult = {
  options: SelectOption[];
  items: DeptProfessorItem[];
  loading: boolean;
  error: unknown;
  reload: () => Promise<void>;
};

/**
 * 학과 선택 -> 해당 학과의 교수 드롭다운
 */
export function useDeptProfessorDropdownOptions(
  deptId?: number
): UseDeptProfessorDropdownOptionsResult {
  const [options, setOptions] = React.useState<SelectOption[]>([]);
  const [items, setItems] = React.useState<DeptProfessorItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<unknown>(null);

  const reload = React.useCallback(async () => {
    if (!deptId) {
      setOptions([]);
      setItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetchDeptProfessorDropdown(deptId);
      const nextItems = res.data ?? [];
      const nextOptions = nextItems.map((c) => ({
        value: String(c.accountId),
        label: c.name,
      }));

      setItems(nextItems);
      setOptions(nextOptions);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [deptId]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  return { options, items, loading, error, reload };
}
