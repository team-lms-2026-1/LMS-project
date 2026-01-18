import { Department } from "../types";

export const mockDepartments: Department[] = [
  {
    id: "D001",
    code: "110001",
    name: "컴퓨터공학과",
    description: "컴퓨터공학 전반(소프트웨어/네트워크/AI/시스템)을 다룹니다.",
    createdAt: "2023-03-01",
    status: "ACTIVE",
  },
  {
    id: "D002",
    code: "110002",
    name: "전자공학과",
    description: "회로/반도체/임베디드/신호처리 중심 학과입니다.",
    createdAt: "2022-09-01",
    status: "ACTIVE",
  },
  {
    id: "D003",
    code: "110003",
    name: "기계공학과",
    description: "기계 설계/제어/열유체 분야를 다룹니다.",
    createdAt: "2021-03-01",
    status: "ACTIVE",
  },
  {
    id: "D004",
    code: "110004",
    name: "산업경영학과",
    description: "데이터 기반 경영/생산/품질 관리를 다룹니다.",
    createdAt: "2020-03-01",
    status: "INACTIVE",
  },
];
