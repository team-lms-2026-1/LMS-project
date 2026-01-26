import type { ReactNode } from "react";

export type TableAlign = "left" | "center" | "right";

export type TableColumn<T> = {
  /** 헤더 라벨 */
  header: ReactNode;

  /** 각 셀 렌더링 (권장) */
  render?: (row: T, index: number) => ReactNode;

  /** 간단 접근용: row[field] 표시 (render 없을 때만) */
  field?: keyof T;

  /** colgroup 제어 */
  width?: number | string;

  /** 정렬 */
  align?: TableAlign;

  /** th/td 클래스 확장 */
  headerClassName?: string;
  cellClassName?: string;

  /** td에 title 속성 자동 지정 (긴 텍스트 툴팁용) */
  title?: (row: T) => string | undefined;

  /** 클릭 가능한 영역에서 특정 column을 클릭해도 rowClick 발생 막고 싶을 때 */
  stopRowClick?: boolean;
};

export type TableMeta = {
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  sort?: string[];
};

export type RowKey<T> = (row: T, index: number) => string | number;

export type TableRowClassName<T> =
  | string
  | ((row: T, index: number) => string | undefined);
