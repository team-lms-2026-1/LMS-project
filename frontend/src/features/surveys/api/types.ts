import { ApiResponse, PageMeta } from "../../curricular/api/types";
export type { ApiResponse, PageMeta };

export type SurveyStatus = "DRAFT" | "OPEN" | "CLOSED";
export type SurveyType = "SATISFACTION" | "COURSE" | "SERVICE" | "ETC";

export const SurveyStatusLabel: Record<SurveyStatus, string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  CLOSED: "Closed",
};

export const SurveyTypeLabel: Record<SurveyType, string> = {
  SATISFACTION: "Satisfaction Survey",
  COURSE: "Course Survey",
  SERVICE: "Service Usage Survey",
  ETC: "Other",
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
  isSubmitted: boolean;
}

export interface SurveyTypeResponse {
  typeCode: string;
  typeName: string;
}

export type SurveyListResponse = ApiResponse<SurveyListItemDto[], PageMeta>;

export type SurveyQuestionType = "RATING" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "ESSAY";

export const SurveyQuestionTypeLabel: Record<SurveyQuestionType, string> = {
  RATING: "Rating (Score)",
  SINGLE_CHOICE: "Multiple Choice (Single)",
  MULTIPLE_CHOICE: "Multiple Choice (Multiple)",
  ESSAY: "Essay (Text)",
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
  type?: SurveyType;
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
