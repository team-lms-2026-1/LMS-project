// 목데이터 타입
export type Department = {
  id: number;
  code: string;
  name: string;
  headProfessor: string;
  studentCount: number;
  professorCount: number;
  isActive: boolean;
};

// 목데이터 리스트
export const DEPT_MOCK_LIST: Department[] = [
  {
    id: 1,
    code: "TH001",
    name: "신학과",
    headProfessor: "김교수",
    studentCount: 391,
    professorCount: 10,
    isActive: true,
  },
  {
    id: 2,
    code: "TH002",
    name: "반주학과",
    headProfessor: "김교수",
    studentCount: 294,
    professorCount: 8,
    isActive: true,
  },
  {
    id: 3,
    code: "TH003",
    name: "기독교학과",
    headProfessor: "김교수",
    studentCount: 31,
    professorCount: 7,
    isActive: true,
  },
  {
    id: 4,
    code: "TH004",
    name: "정보통신과",
    headProfessor: "김교수",
    studentCount: 0,
    professorCount: 0,
    isActive: false,
  },
];
