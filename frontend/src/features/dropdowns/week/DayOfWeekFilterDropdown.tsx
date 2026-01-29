"use client";

import { Dropdown } from "../_shared";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import type { SelectOption } from "@/features/dropdowns/depts/types";

const OPTIONS: SelectOption[] = [
  { value: "MONDAY", label: "월" },
  { value: "TUEDAY", label: "화" },
  { value: "WEDDAY", label: "수" },
  { value: "THUDAY", label: "목" },
  { value: "FRIDAY", label: "금" },
  { value: "SATDAY", label: "토" },
  { value: "SUNDAY", label: "일" },
];

type Props = {
  value?: string;
  onChange?: (v: string) => void;
};

export function DayOfWeekFilterDropdown({ value, onChange }: Props) {
  const { get, setFilters } = useFilterQuery(["dayOfWeek"]);
  const controlled = value !== undefined && onChange !== undefined;

  return (
    <Dropdown
      placeholder="요일"
      value={controlled ? value : get("dayOfWeek")}
      options={OPTIONS}
      onChange={(v) => {
        if (controlled) onChange(v);
        else setFilters({ dayOfWeek: v });
      }}
      onClear={() => {
        if (controlled) onChange("");
        else setFilters({ dayOfWeek: null });
      }}
    />
  );
}
