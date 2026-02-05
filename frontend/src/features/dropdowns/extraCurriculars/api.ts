import { getJson } from "@/lib/http";
import type { ExtraCurricularsDropdownResponse } from "./types";

/**
 * ✅ BFF endpoint
 * - app/api/bff/dropdowns/extra-curriculars/route.ts
 */
export async function fetchExtraCurricularsDropdown() {
  return getJson<ExtraCurricularsDropdownResponse>("/api/dropdown/extra-curriculars", {
    cache: "no-store",
  });
}
