"use client";

import { useMemo } from "react";
import { Dropdown } from "../_shared";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { useLocale } from "@/hooks/useLocale";
import {
  getPeriodDropdownPlaceholder,
  getPeriodOptions,
} from "../localeLabel";

type Props = {
  value?: string;            // "1" | "2" ...
  onChange?: (v: string) => void;
};

export function PeriodFilterDropdown({ value, onChange }: Props) {
  const { get, setFilters } = useFilterQuery(["period"]);
  const { locale } = useLocale();
  const controlled = value !== undefined && onChange !== undefined;
  const options = useMemo(() => getPeriodOptions(locale), [locale]);

  return (
    <Dropdown
      placeholder={getPeriodDropdownPlaceholder(locale)}
      value={controlled ? value : get("period")}
      options={options}
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
