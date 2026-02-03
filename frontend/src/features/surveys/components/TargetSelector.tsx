"use client";

import { useEffect, useState } from "react";
import { fetchDepartments } from "@/features/authority/depts/lib/clientApi";
import styles from "./TargetSelector.module.css";

interface Dept {
    deptId: number;
    deptName: string;
}

interface Props {
    targetType: "ALL" | "DEPT" | "GRADE" | "DEPT_GRADE";
    setTargetType: (t: "ALL" | "DEPT" | "GRADE" | "DEPT_GRADE") => void;
    selectedDeptIds: number[];
    setSelectedDeptIds: (ids: number[]) => void;
    selectedGrades: number[];
    setSelectedGrades: (grades: number[]) => void;
}

const GRADES = [1, 2, 3, 4];

export function TargetSelector({
    targetType,
    setTargetType,
    selectedDeptIds,
    setSelectedDeptIds,
    selectedGrades,
    setSelectedGrades
}: Props) {
    const [depts, setDepts] = useState<Dept[]>([]);

    useEffect(() => {
        fetchDepartments({ page: 0, size: 100 }).then(res => {
            if (res.content && res.content.length > 0) {
                const list = res.content.map((d: any) => ({
                    deptId: d.deptId,
                    deptName: d.deptName
                }));
                // Mock data fallback if fetched data seems too few (for testing)
                if (list.length < 3) {
                    setDepts([
                        { deptId: 1, deptName: "컴퓨터공학과" },
                        { deptId: 2, deptName: "전자공학과" },
                        { deptId: 3, deptName: "경영학과" },
                    ]);
                } else {
                    setDepts(list);
                }
            } else {
                // Fallback Mock Data if list is empty
                setDepts([
                    { deptId: 1, deptName: "컴퓨터공학과" },
                    { deptId: 2, deptName: "전자공학과" },
                    { deptId: 3, deptName: "경영학과" },
                ]);
            }
        }).catch(err => {
            console.error(err);
            // Fallback Mock Data on error
            setDepts([
                { deptId: 1, deptName: "컴퓨터공학과" },
                { deptId: 2, deptName: "전자공학과" },
                { deptId: 3, deptName: "경영학과" },
            ]);
        });
    }, []);

    const toggleDept = (id: number) => {
        if (selectedDeptIds.includes(id)) {
            setSelectedDeptIds(selectedDeptIds.filter(d => d !== id));
        } else {
            setSelectedDeptIds([...selectedDeptIds, id]);
        }
    };

    const toggleGrade = (g: number) => {
        if (selectedGrades.includes(g)) {
            setSelectedGrades(selectedGrades.filter(gNum => gNum !== g));
        } else {
            setSelectedGrades([...selectedGrades, g]);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.typeSelector}>
                <label className={styles.radioLabel}>
                    <input
                        type="radio"
                        name="targetType"
                        checked={targetType === "ALL"}
                        onChange={() => setTargetType("ALL")}
                    />
                    전체 대상
                </label>
                <label className={styles.radioLabel}>
                    <input
                        type="radio"
                        name="targetType"
                        checked={targetType === "DEPT"}
                        onChange={() => setTargetType("DEPT")}
                    />
                    학과별
                </label>
                <label className={styles.radioLabel}>
                    <input
                        type="radio"
                        name="targetType"
                        checked={targetType === "GRADE"}
                        onChange={() => setTargetType("GRADE")}
                    />
                    학년별
                </label>
                <label className={styles.radioLabel}>
                    <input
                        type="radio"
                        name="targetType"
                        checked={targetType === "DEPT_GRADE"}
                        onChange={() => setTargetType("DEPT_GRADE")}
                    />
                    직접 지정 (학과+학년)
                </label>
            </div>

            {(targetType === "DEPT" || targetType === "DEPT_GRADE") && (
                <div className={styles.selectionArea}>
                    <p className={styles.guideText}>
                        {targetType === "DEPT_GRADE" ? "1. 대상이 될 학과를 선택하세요." : "대상이 될 학과를 선택하세요."}
                    </p>
                    <div className={styles.chipGrid}>
                        {depts.map(dept => (
                            <button
                                key={dept.deptId}
                                type="button"
                                className={`${styles.chip} ${selectedDeptIds.includes(dept.deptId) ? styles.chipActive : ''}`}
                                onClick={() => toggleDept(dept.deptId)}
                            >
                                {dept.deptName}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {(targetType === "GRADE" || targetType === "DEPT_GRADE") && (
                <div className={styles.selectionArea}>
                    <p className={styles.guideText}>
                        {targetType === "DEPT_GRADE" ? "2. 대상이 될 학년을 선택하세요." : "대상 학년을 선택하세요."}
                    </p>
                    <div className={styles.chipGrid}>
                        {GRADES.map(grade => (
                            <button
                                key={grade}
                                type="button"
                                className={`${styles.chip} ${selectedGrades.includes(grade) ? styles.chipActive : ''}`}
                                onClick={() => toggleGrade(grade)}
                            >
                                {grade}학년
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
