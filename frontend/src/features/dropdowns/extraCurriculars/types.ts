export type ExtraCurricularItem = {
  extraCurricularId: number;
  name: string;
};

export type ExtraCurricularsDropdownResponse = {
  data: ExtraCurricularItem[];
  meta: null;
};

/** 드롭다운 공통 option 형태로 바꿔서 UI에서 쓰기 좋게 */
export type SelectOption = {
  value: string;
  label: string;
};
