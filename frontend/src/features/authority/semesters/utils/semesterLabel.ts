import { SemesterTerm } from "../api/types";

export function termToLabel(term: SemesterTerm): string {
  switch (term) {
    case "FIRST":
      return "1학기";
    case "SECOND":
      return "2학기";
    case "SUMMER":
      return "여름학기";
    case "WINTER":
      return "겨울학기";
    default:
      return term; // 예외/확장 대비
  }
}
