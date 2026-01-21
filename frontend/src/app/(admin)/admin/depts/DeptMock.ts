// 📄 src/app/(admin)/admin/depts/DeptMock.ts

export type Professor = {
  id: string;
  code: string;      // 교번
  name: string;
  email: string;
  phone: string;
};

export type Student = {
  id: string;
  studentNo: string; // 학번
  name: string;
  grade: number;     // 학년
  status: string;    // 재학상태 (재학중/휴학중/졸업 등)
  majorName: string; // 전공명
};

export type Major = {
  id: string;
  name: string;         // 전공명
  studentCount: number; // 재학생 수
};

export type Department = {
  id: string;              // URL에 쓰는 ID (예: TH001)
  code: string;            // 학과코드
  name: string;            // 학과명
  headProfessor: string;   // 담당교수
  studentCount: number;    // 전체 학생 수
  professorCount: number;  // 교수 수
  isActive: boolean;       // 사용 여부

  professors?: Professor[];
  students?: Student[];
  majors?: Major[];
};

export const DEPT_MOCK_LIST: Department[] = [
  {
    id: "TH001",
    code: "TH001",
    name: "신학과",
    headProfessor: "김교수",
    studentCount: 391,
    professorCount: 10,
    isActive: true,
    professors: [
      {
        id: "p1",
        code: "t10001",
        name: "김현수",
        email: "chulsoo@example.com",
        phone: "010-1234-5678",
      },
      {
        id: "p2",
        code: "t10002",
        name: "박영희",
        email: "park@example.com",
        phone: "010-9876-5432",
      },
      {
        id: "p3",
        code: "t10003",
        name: "이민수",
        email: "mins@example.com",
        phone: "010-5555-1234",
      },
    ],
    students: [
      {
        id: "s1",
        studentNo: "20240001",
        name: "홍길동",
        grade: 1,
        status: "재학중",
        majorName: "신학 (주)",
      },
      {
        id: "s2",
        studentNo: "20230015",
        name: "김명주",
        grade: 3,
        status: "휴학중",
        majorName: "신학 (주)",
      },
      {
        id: "s3",
        studentNo: "20220110",
        name: "이재훈",
        grade: 4,
        status: "졸업",
        majorName: "신학 (주)",
      },
    ],
    majors: [
      { id: "m1", name: "신학", studentCount: 150 },
      { id: "m2", name: "상담학", studentCount: 170 },
      { id: "m3", name: "교육학", studentCount: 203 },
    ],
  },

  // 다른 학과는 상세 데이터 없이 목록만 필요하면 간단히 써도 됨
  {
    id: "TH002",
    code: "TH002",
    name: "반주학과",
    headProfessor: "김교수",
    studentCount: 294,
    professorCount: 8,
    isActive: true,
  },
  {
    id: "TH003",
    code: "TH003",
    name: "기독교학과",
    headProfessor: "김교수",
    studentCount: 311,
    professorCount: 7,
    isActive: true,
  },
  {
    id: "TH004",
    code: "TH004",
    name: "정보통신과",
    headProfessor: "김교수",
    studentCount: 0,
    professorCount: 0,
    isActive: false,
  },
];
