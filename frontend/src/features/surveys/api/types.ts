import { ApiResponse, PageMeta } from "../../curricular/api/types";

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

export interface SurveyListItemDto {
  surveyId: number;
  type: SurveyType;
  title: string;
  status: SurveyStatus;
  startAt: string; // yyyy-MM-dd HH:mm
  endAt: string; // yyyy-MM-dd HH:mm
  viewCount?: number;
  createdAt: string;
}

export type SurveyListResponse = ApiResponse<SurveyListItemDto[], PageMeta>;

export type SurveyQuestionType = "RATING" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "ESSAY";

export const SurveyQuestionTypeLabel: Record<SurveyQuestionType, string> = {
  RATING: "척도형 (점수)",
  SINGLE_CHOICE: "객관식 (단일 선택)",
  MULTIPLE_CHOICE: "객관식 (다중 선택)",
  ESSAY: "주관식 (서술형)",
};

export interface QuestionResponseDto {
  questionId: number;
  questionText: string;
  sortOrder: number;
  minVal: number;
  maxVal: number;
  minLabel: string;
  maxLabel: string;
  isRequired: boolean;
  questionType: SurveyQuestionType;
  options?: string[];
}

export interface SurveyDetailDto {
  surveyId: number;
  type: SurveyType;
  title: string;
  description: string;
  status: SurveyStatus;
  startAt: string;
  endAt: string;
  questions: QuestionResponseDto[];
}

export type SurveyDetailResponse = ApiResponse<SurveyDetailDto, null>;

export interface QuestionStatsDto {
  questionId: number;
  title: string;
  type: SurveyQuestionType;
  answerCounts: Record<string, number>;
  essayAnswers: string[];
}

export interface SurveyStatsDto {
  surveyId: number;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  totalTargets: number;
  submittedCount: number;
  responseRate: number;
  responseByDept: Record<string, number>;
  responseByGrade: Record<string, number>;
  createdAt: string;
  questions: QuestionStatsDto[];
}

export type SurveyStatsResponse = ApiResponse<SurveyStatsDto, null>;

// Request DTOs
export interface QuestionDto {
  questionText: string;
  sortOrder: number;
  minVal?: number;
  maxVal?: number;
  minLabel?: string;
  maxLabel?: string;
  isRequired?: boolean;
  questionType?: SurveyQuestionType;
  options?: string[];
}

export interface TargetFilterDto {
  genType: "ALL" | "DEPT" | "GRADE" | "DEPT_GRADE";
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

export interface SurveyPatchRequest {
  title?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  questions?: QuestionDto[];
}

export interface SurveySubmitRequest {
  surveyId: number;
  responses: Record<string, any>; // key: questionId, value: score | text | string[]
}

export interface SurveyParticipantDto {
  targetId: number;
  accountId: number;
  loginId: string;
  status: string;
  submittedAt: string | null;
}

export type SurveyParticipantResponse = ApiResponse<SurveyParticipantDto[], PageMeta>;
