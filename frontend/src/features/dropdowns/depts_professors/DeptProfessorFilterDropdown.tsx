"use client";

import * as React from "react";
import { useDeptProfessorDropdownOptions } from "./hooks";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { Dropdown } from "../_shared";

type Props = {
  /** 모달에서 사용할 때 (controlled) */
  deptId?: string;
  value?: string;         // accountId
  onChange?: (v: string) => void;
};

export function DeptProfessorFilterDropdown({ deptId, value, onChange }: Props) {
  const { get, setFilters } = useFilterQuery(["deptId", "accountId"]);

  const controlled = value !== undefined && onChange !== undefined;

  const baseDeptId = deptId ?? get("deptId");
  const deptIdNum = baseDeptId ? Number(baseDeptId) : undefined;

  const { options, loading } = useDeptProfessorDropdownOptions(deptIdNum);

  // ✅ 학과 변경 시 교수 초기화
  React.useEffect(() => {
    if (controlled) onChange?.("");
    else setFilters({ accountId: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseDeptId]);

  return (
    <Dropdown
      placeholder="담당교수"
      loading={loading}
      disabled={!deptIdNum}
      value={controlled ? value : get("accountId")}
      options={options}
      onChange={(v) => {
        if (controlled) onChange(v);
        else setFilters({ accountId: v });
      }}
      onClear={() => {
        if (controlled) onChange("");
        else setFilters({ accountId: null });
      }}
    />
  );
}
