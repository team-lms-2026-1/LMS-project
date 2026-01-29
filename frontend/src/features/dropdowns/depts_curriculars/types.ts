export type DeptCurricularItem = {
  curricularId: number;
  curricularName: string;
};

export type DeptCurricularsDropdownResponse = {
  data: DeptCurricularItem[];
  meta: null;
};

/** 드롭다운 공통 option 형태로 바꿔서 UI에서 쓰기 좋게 */
export type SelectOption = {
  value: string;
  label: string;
};
