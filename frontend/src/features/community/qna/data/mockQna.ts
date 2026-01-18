import type { QnaItem } from "../types";

export const mockQna: QnaItem[] = [
  {
    id: "1",
    no: "00001",
    category: "서비스",
    title: "2026년 1월 정기 시스템 점검 안내",
    author: "최희준",
    createdAt: "2026.01.07",
    views: 107,
    content:
      "안녕하세요. 관리자입니다.\n보다 안정적인 서비스 제공을 위해 아래와 같이 정기 시스템 점검이 진행될 예정입니다.\n\n- 점검 일시: 2026년 1월 7일(수) 02:00 ~ 05:00\n- 점검 대상: 서비스 전체 시스템\n\n점검 영향이 있나요?",
    answer: {
      author: "관리자",
      createdAt: "2026.01.08",
      content: "확인했습니다.",
    },
  },
  {
    id: "2",
    no: "00002",
    category: "학습",
    title: "학습 공간 대여 신청이 안 됩니다.",
    author: "홍길동",
    createdAt: "2024.12.07",
    views: 700,
    content: "학습 공간 대여 신청 버튼이 비활성화되어 있어요. 조치 방법이 있나요?",
    // 미답변
  },
  {
    id: "3",
    no: "00003",
    category: "정책",
    title: "커뮤니티 정책 관련 문의",
    author: "김철수",
    createdAt: "2024.11.07",
    views: 1245,
    content: "게시글 삭제 기준이 궁금합니다.",
    // 미답변
  },
];
