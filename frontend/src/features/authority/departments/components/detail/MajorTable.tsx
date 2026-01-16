"use client";

import { Major } from "../../types";
import styles from "../../styles/DepartmentDetailPage.module.css";

type Props = { data: Major[] };

export default function MajorTable({ data }: Props) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: 140 }}>전공코드</th>
            <th>전공명</th>
            <th style={{ width: 220 }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={3} className={styles.empty}>
                데이터가 없습니다.
              </td>
            </tr>
          ) : (
            data.map((m) => (
              <tr key={m.id}>
                <td>{m.code}</td>
                <td>{m.name}</td>
                <td>
                  <div className={styles.rowActions}>
                    <button type="button" className={styles.smallBtn}>
                      수정
                    </button>
                    <button type="button" className={styles.smallBtnDanger}>
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
