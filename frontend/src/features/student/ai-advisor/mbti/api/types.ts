export type ApiResponse<T, M = null> = {
  data: T;
  meta: M;
};

export type MbtiChoice = {
  choiceId: number;
  content: string;
};

export type MbtiQuestion = {
  questionId: number;
  content: string;
  sortOrder: number;
  choices: MbtiChoice[];
  createdAt: string | null;
  updatedAt: string | null;
};

export type MbtiAnswer = {
  questionId: number;
  choiceId: number;
};

export type MbtiSubmitRequest = {
  answers: MbtiAnswer[];
};

export type MbtiScore = {
  e: number;
  i: number;
  s: number;
  n: number;
  t: number;
  f: number;
  j: number;
  p: number;
};

export type MbtiResult = {
  resultId: number;
  accountId: number;
  mbtiType: string;
  score: MbtiScore;
  createdAt: string;
};

export type InterestKeyword = {
  id: number;
  keyword: string;
  category: string;
  sortOrder: number;
};

export type MbtiSelectedKeyword = {
  id: number;
  keyword: string;
  category: string;
};

export type MbtiRecommendedJob = {
  rank: number;
  jobCatalogId: number;
  jobCode: string;
  jobName: string;
  reason: string;
};

export type MbtiRecommendation = {
  recommendationId: number;
  mbtiResultId: number;
  mbtiType: string;
  selectedKeywords: MbtiSelectedKeyword[];
  recommendations: MbtiRecommendedJob[];
  generatedAt: string;
};

export type MbtiRecommendationRequest = {
  keywordIds: number[];
};

export type MbtiQuestionResponse = ApiResponse<MbtiQuestion[], null>;
export type MbtiResultResponse = ApiResponse<MbtiResult | null, null>;
export type MbtiInterestKeywordResponse = ApiResponse<InterestKeyword[], null>;
export type MbtiRecommendationResponse = ApiResponse<MbtiRecommendation, null>;
export type MbtiLatestRecommendationResponse = ApiResponse<MbtiRecommendation | null, null>;
