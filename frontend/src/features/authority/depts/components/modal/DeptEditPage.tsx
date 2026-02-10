"use client";

import { useEffect, useState } from "react";
import styles from "@/features/authority/depts/components/modal/DeptCreatePage.module.css";
import { getDeptEdit, updateDept } from "@/features/authority/depts/api/deptsApi";
import type { ProfessorDropdownItem } from "@/features/authority/depts/api/types";

type DeptEditPageProps = {
    deptId: number;
    onClose: () => void;
    onUpdated?: () => void | Promise<void>;
};

export default function DeptEditPage({ deptId, onClose, onUpdated }: DeptEditPageProps) {
    // Form State
    const [deptCode, setDeptCode] = useState("");
    const [deptName, setDeptName] = useState("");
    const [description, setDescription] = useState("");
    const [headProfId, setHeadProfId] = useState<number | null>(null);
    const [professors, setProfessors] = useState<ProfessorDropdownItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setFetching(true);
                const res = await getDeptEdit(deptId);
                const { dept, professors } = res.data;

                setDeptCode(dept.deptCode);
                setDeptName(dept.deptName);
                setDescription(dept.description);
                setHeadProfId(dept.headProfessorAccountId);
                setProfessors(professors);
            } catch (err) {
                console.error(err);
                setError("데이터를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [deptId]);

    const handleSubmit = async () => {
        if (!deptName) {
            setError("학과이름은 필수입니다.");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await updateDept(deptId, {
                deptName,
                description,
                headProfessorAccountId: headProfId,
            });

            if (onUpdated) {
                await onUpdated();
            }
            onClose();
        } catch (err) {
            console.error(err);
            setError("학과 수정 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className={styles.backdrop}>
                <div className={styles.modal}>
                    <div className={styles.page}>
                        <p>로딩 중...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.backdrop}>
            <div className={styles.modal}>
                <div className={styles.page}>
                    <h1 className={styles.title}>학과 수정</h1>

                    <div className={styles.field}>
                        <label className={styles.label}>학과코드</label>
                        <input
                            type="text"
                            value={deptCode}
                            disabled
                            className={styles.input}
                            style={{ background: "#f5f5f5" }}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>학과이름</label>
                        <input
                            type="text"
                            value={deptName}
                            onChange={(e) => setDeptName(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>담당교수</label>
                        <select
                            value={headProfId ?? ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                setHeadProfId(val ? Number(val) : null);
                            }}
                            className={styles.input}
                        >
                            <option value="">(선택 안함 / 공석)</option>
                            {professors.map((p) => (
                                <option key={p.accountId} value={p.accountId}>
                                    {p.name} ({p.accountId})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>설명</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={styles.textarea}
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.footer}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={onClose}
                            disabled={loading}
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            className={styles.submitButton}
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "수정 중..." : "수정 저장"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
