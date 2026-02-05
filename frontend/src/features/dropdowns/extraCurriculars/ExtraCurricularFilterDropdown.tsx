"use client";

import { useExtraCurricularsDropdownOptions } from "./hooks";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { Dropdown } from "../_shared";

type Props = {
  /** 모달에서 사용할 때 */
  value?: string; // ex) "3" or "" (미선택)
  onChange?: (v: string) => void;
};

export function ExtraCurricularFilterDropdown({ value, onChange }: Props) {
  const { options, loading } = useExtraCurricularsDropdownOptions();
  const { get, setFilters } = useFilterQuery(["extraCurricularId"]);

  const controlled = value !== undefined && onChange !== undefined;

  return (
    <Dropdown
      placeholder="비교과"
      loading={loading}
      value={controlled ? value : get("extraCurricularId")}
      options={options}
      onChange={(v) => {
        if (controlled) onChange(v);
        else setFilters({ extraCurricularId: v });
      }}
      onClear={() => {
        if (controlled) onChange("");
        else setFilters({ extraCurricularId: null });
      }}
    />
  );
}
