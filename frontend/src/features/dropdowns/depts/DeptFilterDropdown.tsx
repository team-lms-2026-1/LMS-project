"use client";

import { useDeptsDropdownOptions } from "./hooks";
import { useFilterQuery } from "@/features/dropdowns/_shared/useFilterQuery";
import { Dropdown } from "../_shared";

export function DeptFilterDropdown() {
  const { options, loading } = useDeptsDropdownOptions();
  const { get, setFilters } = useFilterQuery(["deptId"]);

  return (
    <Dropdown
      placeholder="학과"
      loading={loading}
      value={get("deptId")}
      options={options}
      onChange={(v) => setFilters({ deptId: v })}
      onClear={() => setFilters({ deptId: null })}
    />
  );
}
