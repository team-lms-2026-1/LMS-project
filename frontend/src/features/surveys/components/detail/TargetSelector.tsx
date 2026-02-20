"use client";

import { DeptFilterDropdown } from "@/features/dropdowns/depts/DeptFilterDropdown";
import { useDeptsDropdownOptions } from "@/features/dropdowns/depts";
import styles from "./TargetSelector.module.css";

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
    const { options: deptOptions, loading: deptLoading } = useDeptsDropdownOptions();

    const addDept = (id: number) => {
        if (!selectedDeptIds.includes(id)) {
            setSelectedDeptIds([...selectedDeptIds, id]);
        }
    };

    const removeDept = (id: number) => {
        setSelectedDeptIds(selectedDeptIds.filter(d => d !== id));
    };

    const toggleGrade = (g: number) => {
        if (selectedGrades.includes(g)) {
            setSelectedGrades(selectedGrades.filter(gNum => gNum !== g));
        } else {
            setSelectedGrades([...selectedGrades, g]);
        }
    };

    const getDeptName = (id: number) => {
        return deptOptions.find(o => o.value === String(id))?.label || `학과 ${id}`;
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

                    <div style={{ maxWidth: '300px', marginBottom: '12px' }}>
                        <DeptFilterDropdown
                            value=""
                            onChange={(val) => {
                                if (val) addDept(Number(val));
                            }}
                        />
                    </div>

                    <div className={styles.chipGrid}>
                        {selectedDeptIds.map(deptId => (
                            <button
                                key={deptId}
                                type="button"
                                className={`${styles.chip} ${styles.chipActive}`}
                                onClick={() => removeDept(deptId)}
                            >
                                {getDeptName(deptId)} ✕
                            </button>
                        ))}
                        {selectedDeptIds.length === 0 && (
                            <span className="text-sm text-gray-400">선택된 학과가 없습니다.</span>
                        )}
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
