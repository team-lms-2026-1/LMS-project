export type ApiResponse<T, M = null> = {
  data: T;
  meta: M;
};

/** DTO */
export type AiaskDto = {
  answer: string;
}

/** Response */
export type AiaskResponse = ApiResponse<AiaskDto, null>;
export type SuccessResponse = ApiResponse<{ success: boolean }, null>;

/** Request */

export type AiaskRequest = {
  question: string;
}