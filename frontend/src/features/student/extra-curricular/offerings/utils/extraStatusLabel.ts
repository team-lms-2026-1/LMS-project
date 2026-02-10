import type { ExtraCompletionStatus, ExtraOfferingStatus, ExtraSessionStatus } from "../api/types";

export function extraOfferingStatusLabel(v: ExtraOfferingStatus) {
  switch (v) {
    case "DRAFT":
      return "작성중";
    case "OPEN":
      return "개설";
    case "ENROLLMENT_CLOSED":
      return "수강신청마감";
    case "IN_PROGRESS":
      return "운영중";
    case "COMPLETED":
      return "운영종료";
    case "CANCELED":
      return "취소";
    default:
      return v;
  }
}

export function extraSessionStatusLabel(v: ExtraSessionStatus) {
  switch (v) {
    case "OPEN":
      return "진행";
    case "CLOSED":
      return "마감";
    case "CANCELED":
      return "취소";
    default:
      return v;
  }
}

export function extraCompletionStatusLabel(v: ExtraCompletionStatus) {
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
