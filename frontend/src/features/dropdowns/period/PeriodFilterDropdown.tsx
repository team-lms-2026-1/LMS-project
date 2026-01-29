"use client";

import { Dropdown } from "../_shared";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import type { SelectOption } from "@/features/dropdowns/depts/types";

const OPTIONS: SelectOption[] = [
  { value: "1", label: "1교시" },
  { value: "2", label: "2교시" },
  { value: "3", label: "3교시" },
  { value: "4", label: "4교시" },
  { value: "5", label: "5교시" },
  { value: "6", label: "6교시" },
];

type Props = {
  value?: string;            // "1" | "2" ...
  onChange?: (v: string) => void;
};

export function PeriodFilterDropdown({ value, onChange }: Props) {
  const { get, setFilters } = useFilterQuery(["period"]);
  const controlled = value !== undefined && onChange !== undefined;

  return (
    <Dropdown
      placeholder="교시"
      value={controlled ? value : get("period")}
      options={OPTIONS}
      onChange={(v) => {
        if (controlled) onChange(v);
        else setFilters({ period: v });
      }}
      onClear={() => {
        if (controlled) onChange("");
        else setFilters({ period: null });
      }}
    />
  );
}
