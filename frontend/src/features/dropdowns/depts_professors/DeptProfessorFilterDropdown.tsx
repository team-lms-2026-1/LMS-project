"use client";

import * as React from "react";

import { Dropdown } from "../_shared";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { useDeptProfessorDropdownOptions } from "./hooks";
import type { DeptProfessorItem } from "./types";

type Props = {
  deptId?: string;
  value?: string;
  onChange?: (v: string) => void;
  onSelectItem?: (item: DeptProfessorItem | null) => void;
};

export function DeptProfessorFilterDropdown({
  deptId,
  value,
  onChange,
  onSelectItem,
}: Props) {
  const { get, setFilters } = useFilterQuery(["deptId", "accountId"]);

  const controlled = value !== undefined && onChange !== undefined;

  const baseDeptId = deptId ?? get("deptId");
  const deptIdNum = baseDeptId ? Number(baseDeptId) : undefined;

  const { options, items, loading } = useDeptProfessorDropdownOptions(deptIdNum);

  const prevDeptIdRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    if (prevDeptIdRef.current === undefined) {
      prevDeptIdRef.current = baseDeptId;
      return;
    }

    if (prevDeptIdRef.current !== baseDeptId) {
      if (controlled) onChange?.("");
      else setFilters({ accountId: null });
      onSelectItem?.(null);
      prevDeptIdRef.current = baseDeptId;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseDeptId]);

  return (
    <Dropdown
      placeholder="담당교수"
      loading={loading}
      disabled={!deptIdNum}
      value={controlled ? (value ?? "") : get("accountId")}
      options={options}
      onChange={(v) => {
        if (controlled) onChange?.(v);
        else setFilters({ accountId: v });

        const selected = items.find((item) => String(item.accountId) === v) ?? null;
        onSelectItem?.(selected);
      }}
      onClear={() => {
        if (controlled) onChange?.("");
        else setFilters({ accountId: null });
        onSelectItem?.(null);
      }}
    />
  );
}
