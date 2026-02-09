export function extraCompletionStatusLabel(v: string) {
  switch (v) {
    case "IN_PROGRESS":
      return "이수중";
    case "PASSED":
      return "수료";
    case "FAILED":
      return "미수료";
    default:
      return v;
  }
}
