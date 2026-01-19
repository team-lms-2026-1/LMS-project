export type QnaCategory = "서비스" | "학습" | "정책" | "기타";

export interface QnaAnswer {
  author: string;     // 관리자/담당자
  createdAt: string;  // YYYY.MM.DD
  content: string;
}

export interface QnaItem {
  id: string;
  no: string;               // 00001
  category: QnaCategory;

  title: string;            // 질문 제목
  content: string;          // 질문 내용

  author: string;           // 질문 작성자
  createdAt: string;        // 질문 작성일
  views: number;

  answer?: QnaAnswer;       // 없으면 미답변, 있으면 답변완료
}
