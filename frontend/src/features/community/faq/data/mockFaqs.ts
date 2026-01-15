import type { FaqItem } from "../types";

export const mockFaqs: FaqItem[] = [
  {
    id: "1",
    no: "00001",
    category: "서비스",
    title: "2026년 1월 정기 시스템 점검 안내",
    author: "최희준",
    createdAt: "2026.01.07",
    views: 107,
    content:
      "안녕하세요. 관리자입니다.\n보다 안정적인 서비스 제공을 위해 아래와 같이 정기 시스템 점검이 진행될 예정입니다.\n\n- 점검 일시: 2026년 1월 7일(수) 02:00 ~ 05:00\n- 점검 대상: 서비스 전체 시스템\n\n[점검 영향]\n- 점검 시간 동안 서비스 접속이 일시적으로 제한될 수 있습니다.\n- 점검 상황에 따라 종료 시간이 변동될 수 있습니다.\n\n감사합니다.",
  },
  {
    id: "2",
    no: "00002",
    category: "학습",
    title: "학습 공간 대여 신청 방법",
    author: "관리자",
    createdAt: "2024.12.07",
    views: 700,
    content: "학습 공간 대여 신청 방법 안내입니다.",
  },
  {
    id: "3",
    no: "00003",
    category: "정책",
    title: "커뮤니티 운영 정책 안내",
    author: "운영팀",
    createdAt: "2024.11.07",
    views: 1245,
    content: "커뮤니티 운영 정책 안내입니다.",
  },
  {
    id: "4",
    no: "00004",
    category: "서비스",
    title: "로그인 오류 발생 시 조치 방법",
    author: "관리자",
    createdAt: "2024.01.07",
    views: 1245,
    content: "로그인 오류 발생 시 조치 방법 안내입니다.",
  },
];
