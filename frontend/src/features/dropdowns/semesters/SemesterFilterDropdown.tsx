"use client";

import { useSemestersDropdownOptions } from "./hooks";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { Dropdown } from "../_shared";

type Props = {
  /** 모달에서 사용할 때 */
  value?: string; // ex) "3" or "" (미선택)
  onChange?: (v: string) => void;
};

export function SemesterFilterDropdown({ value, onChange }: Props) {
  const { options, loading } = useSemestersDropdownOptions();
  const { get, setFilters } = useFilterQuery(["semesterId"]);

  const controlled = value !== undefined && onChange !== undefined;

  return (
    <Dropdown
      placeholder="학기"
      loading={loading}
      value={controlled ? value : get("semesterId")}
      options={options}
      onChange={(v) => {
        if (controlled) onChange(v);
        else setFilters({ semesterId: v });
      }}
      onClear={() => {
        if (controlled) onChange("");
        else setFilters({ semesterId: null });
      }}
    />
  );
}
