export type QuestionType = 'SCALE' | 'SHORT';

export interface Weights {
  C1: number;
  C2: number;
  C3: number;
  C4: number;
  C5: number;
  C6: number;
  [key: string]: number;
}

export interface SurveyQuestion {
  questionId?: number;
  text: string;
  type: QuestionType;
  weights: Weights;
  order?: number;
}

export interface SurveyCreateRequest {
  title: string;
  semesterId: number;
  startAt: string; // ISO String
  endAt: string;   // ISO String
  questions: SurveyQuestion[];
}

export interface SurveyListResponse {
  diagnosisId: number;
  title: string;
  semesterName: string;
  createdAt: string;
  status: string;
}