export type SurveyStatus = "DRAFT" | "OPEN" | "CLOSED";
export type SurveyType = "SATISFACTION" | "COURSE" | "SERVICE" | "ETC";

export const SurveyStatusLabel: Record<SurveyStatus, string> = {
  DRAFT: "작성 중",
  OPEN: "진행 중",
  CLOSED: "종료됨",
};

export const SurveyTypeLabel: Record<SurveyType, string> = {
  SATISFACTION: "만족도 조사",
  COURSE: "수강 설문",
  SERVICE: "서비스 이용 조사",
  ETC: "기타",
};

export interface SurveyListResponse {
  surveyId: number;
  type: SurveyType;
  title: string;
  status: SurveyStatus;
  startAt: string; // yyyy-MM-dd HH:mm
  endAt: string; // yyyy-MM-dd HH:mm
  viewCount?: number;
}

export interface QuestionResponseDto {
  questionId: number;
  questionText: string;
  sortOrder: number;
  minVal: number;
  maxVal: number;
  minLabel: string;
  maxLabel: string;
  isRequired: boolean;
}

export interface SurveyDetailResponse {
  surveyId: number;
  type: SurveyType;
  title: string;
  description: string;
  status: SurveyStatus;
  startAt: string;
  endAt: string;
  questions: QuestionResponseDto[];
}

export interface SurveyStatsResponse {
  surveyId: number;
  totalTargets: number;
  submittedCount: number;
  responseRate: number;
  responseByDept: Record<string, number>;
  responseByGrade: Record<string, number>;
}

// Request DTOs
export interface QuestionDto {
  questionText: string;
  sortOrder: number;
  minVal?: number;
  maxVal?: number;
  minLabel?: string;
  maxLabel?: string;
  isRequired?: boolean;
}

export interface TargetFilterDto {
  genType: "ALL" | "DEPT" | "GRADE" | "DEPT_GRADE"; // [추가] DEPT_GRADE
  deptIds?: number[];
  userIds?: number[];
  gradeLevels?: number[];
}

export interface SurveyCreateRequest {
  type: SurveyType;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  questions: QuestionDto[];
  targetFilter?: TargetFilterDto;
}


export interface SurveyUpdateRequest {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  questions: QuestionDto[];
}

export interface SurveySubmitRequest {
  surveyId: number;
  responses: Record<string, number>; // key: questionId, value: score
}
