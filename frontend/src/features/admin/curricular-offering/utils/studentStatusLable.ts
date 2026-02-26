import type { CompletionStatus, EnrollmentStatus, OfferingStatus, DayOfWeekType } from "../api/types";

export function enrollmentStatusLabel(v: EnrollmentStatus) {
  switch (v) {
    case "ENROLLED":
      return "수강";
    case "CANCELED":
      return "수강취소";
    default:
      return v;
  }
}

export function completionStatusLabel(v: CompletionStatus) {
  switch (v) {
    case "IN_PROGRESS":
      return "이수중";
    case "PASSED":
      return "이수완료";
    case "FAILED":
      return "미이수";
    default:
      return v;
  }
}

export function offeringStatusLabel(v: OfferingStatus) {
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
      return "폐강";
    default:
      return v;
  }
}

export function dayOfWeekLabel(v: DayOfWeekType) {
  switch (v) {
    case "MONDAY":
      return "월";
    case "TUESDAY":
      return "화";
    case "WEDNESDAY":
      return "수";
    case "THURSDAY":
      return "목";
    case "FRIDAY":
      return "금";
    case "SATURDAY":
      return "토";
    case "SUNDAY":
      return "일";
    default:
      return v;
  }
}
