"use client";

import Link from "next/link";
import { Department, DepartmentStatus } from "../../types";
import styles from "../../styles/DepartmentListPage.module.css";

type Props = {
  data: Department[];
  onToggleStatus: (id: string, next: DepartmentStatus) => void;
};

export default function DepartmentTable({ data, onToggleStatus }: Props) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: 120 }}>학과코드</th>
            <th>학과명</th>
            <th style={{ width: 140 }}>등록일</th>
            <th style={{ width: 120 }}>상태</th>
            <th style={{ width: 140 }}>사용여부</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className={styles.empty} colSpan={5}>
                데이터가 없습니다.
              </td>
            </tr>
          ) : (
            data.map((d) => (
              <tr key={d.id}>
                <td>{d.code}</td>
                <td>
                  <Link className={styles.link} href={`/authority/departments/${d.id}`}>
                    {d.name}
                  </Link>
                </td>
                <td>{d.createdAt}</td>
                <td>
                  <span
                    className={
                      d.status === "ACTIVE" ? styles.badgeActive : styles.badgeInactive
                    }
                  >
                    {d.status === "ACTIVE" ? "활성" : "비활성"}
                  </span>
                </td>
                <td>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={d.status === "ACTIVE"}
                      onChange={(e) =>
                        onToggleStatus(d.id, e.target.checked ? "ACTIVE" : "INACTIVE")
                      }
                    />
                    <span className={styles.slider} />
                  </label>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
