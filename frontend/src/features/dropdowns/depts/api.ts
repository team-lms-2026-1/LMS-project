import { getJson } from "@/lib/http";
import type { DeptsDropdownResponse } from "./types";

/**
 * ✅ BFF endpoint
 * - app/api/bff/dropdowns/depts/route.ts
 */
export async function fetchDeptsDropdown() {
  return getJson<DeptsDropdownResponse>("/api/dropdown/depts", {
    cache: "no-store",
  });
}
