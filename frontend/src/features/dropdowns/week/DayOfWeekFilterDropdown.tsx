"use client";

import { useMemo } from "react";
import { Dropdown } from "../_shared";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { useLocale } from "@/hooks/useLocale";
import {
  getDayOfWeekDropdownPlaceholder,
  getDayOfWeekOptions,
} from "../localeLabel";

type Props = {
  value?: string;
  onChange?: (v: string) => void;
};

export function DayOfWeekFilterDropdown({ value, onChange }: Props) {
  const { get, setFilters } = useFilterQuery(["dayOfWeek"]);
  const { locale } = useLocale();
  const controlled = value !== undefined && onChange !== undefined;
  const options = useMemo(() => getDayOfWeekOptions(locale), [locale]);

  return (
    <Dropdown
      placeholder={getDayOfWeekDropdownPlaceholder(locale)}
      value={controlled ? value : get("dayOfWeek")}
      options={options}
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
