"use client";

import { Student } from "../../types";
import styles from "../../styles/DepartmentDetailPage.module.css";

type Props = { data: Student[] };

export default function StudentTable({ data }: Props) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: 160 }}>학번</th>
            <th style={{ width: 160 }}>이름</th>
            <th>이메일</th>
            <th style={{ width: 180 }}>전화번호</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={4} className={styles.empty}>
                데이터가 없습니다.
              </td>
            </tr>
          ) : (
            data.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.phone}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
