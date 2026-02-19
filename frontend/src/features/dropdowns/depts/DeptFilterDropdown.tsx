"use client";

import { useDeptsDropdownOptions } from "./hooks";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { Dropdown } from "../_shared";
import { useLocale } from "@/hooks/useLocale";
import { getDeptDropdownPlaceholder } from "../localeLabel";

type Props = {
  /** 모달에서 사용할 때 */
  value?: string; // ex) "3" or "" (미선택)
  onChange?: (v: string) => void;
};

export function DeptFilterDropdown({ value, onChange }: Props) {
  const { options, loading } = useDeptsDropdownOptions();
  const { locale } = useLocale();
  const { get, setFilters } = useFilterQuery(["deptId"]);

  const controlled = value !== undefined && onChange !== undefined;

  return (
    <Dropdown
      placeholder={getDeptDropdownPlaceholder(locale)}
      loading={loading}
      value={controlled ? value : get("deptId")}
      options={options}
      onChange={(v) => {
        if (controlled) onChange(v);
        else setFilters({ deptId: v });
      }}
      onClear={() => {
        if (controlled) onChange("");
        else setFilters({ deptId: null });
      }}
    />
  );
}
