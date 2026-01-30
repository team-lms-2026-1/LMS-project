"use client";

import * as React from "react";
import { useDeptProfessorDropdownOptions } from "./hooks";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { Dropdown } from "../_shared";

type Props = {
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

  // ✅ "학과 변경"일 때만 교수 초기화 (마운트 시에는 초기화 금지)
  const prevDeptIdRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    // 첫 마운트
    if (prevDeptIdRef.current === undefined) {
      prevDeptIdRef.current = baseDeptId;
      return;
    }

    // 학과가 실제로 바뀐 경우에만 초기화
    if (prevDeptIdRef.current !== baseDeptId) {
      if (controlled) onChange?.("");
      else setFilters({ accountId: null });
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
        if (controlled) onChange!(v);
        else setFilters({ accountId: v });
      }}
      onClear={() => {
        if (controlled) onChange!("");
        else setFilters({ accountId: null });
      }}
    />
  );
}
