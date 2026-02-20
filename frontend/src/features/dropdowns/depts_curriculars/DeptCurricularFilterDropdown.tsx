"use client";

import * as React from "react";
import { useDeptCurricularDropdownOptions } from "./hooks";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { Dropdown } from "../_shared";
import { useLocale } from "@/hooks/useLocale";
import { getCurricularDropdownPlaceholder } from "../localeLabel";

type Props = {
  /** 모달에서 사용할 때 (controlled) */
  deptId?: string;        // ✅ 모달에서 deptId를 넘겨줄 때
  value?: string;         // curricularId
  onChange?: (v: string) => void;
};

export function DeptCurricularFilterDropdown({ deptId, value, onChange }: Props) {
  const { get, setFilters } = useFilterQuery(["deptId", "curricularId"]);
  const { locale } = useLocale();

  const controlled = value !== undefined && onChange !== undefined;

  // ✅ deptId는: (1) props 우선, 없으면 (2) query에서 읽기
  const baseDeptId = deptId ?? get("deptId");
  const deptIdNum = baseDeptId ? Number(baseDeptId) : undefined;

  const { options, loading } = useDeptCurricularDropdownOptions(deptIdNum);

  // ✅ 학과 변경 시 교과 초기화
  React.useEffect(() => {
    if (controlled) onChange?.("");
    else setFilters({ curricularId: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseDeptId]);

  return (
    <Dropdown
      placeholder={getCurricularDropdownPlaceholder(locale)}
      loading={loading}
      disabled={!deptIdNum}
      value={controlled ? value : get("curricularId")}
      options={options}
      onChange={(v) => {
        if (controlled) onChange(v);
        else setFilters({ curricularId: v });
      }}
      onClear={() => {
        if (controlled) onChange("");
        else setFilters({ curricularId: null });
      }}
    />
  );
}
