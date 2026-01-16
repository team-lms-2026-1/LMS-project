"use client";

import { Professor } from "../../types";
import styles from "../../styles/DepartmentDetailPage.module.css";

type Props = { data: Professor[] };

export default function ProfessorTable({ data }: Props) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: 140 }}>교번</th>
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
            data.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.email}</td>
                <td>{p.phone}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
