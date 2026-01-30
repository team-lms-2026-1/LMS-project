import { getJson } from "@/lib/http";
import type { SemestersDropdownResponse } from "./types";

export async function fetchSemestersDropdown() {
  return getJson<SemestersDropdownResponse>("/api/dropdown/semesters", {
    cache: "force-cache",
  });
}
