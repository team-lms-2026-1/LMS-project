"use client";

import { DeptFilterDropdown } from "@/features/dropdowns/depts/DeptFilterDropdown";
import { useDeptsDropdownOptions } from "@/features/dropdowns/depts";
import styles from "./TargetSelector.module.css";
import { useI18n } from "@/i18n/useI18n";

interface Props {
    targetType: "ALL" | "DEPT" | "GRADE" | "DEPT_GRADE";
    setTargetType: (t: "ALL" | "DEPT" | "GRADE" | "DEPT_GRADE") => void;
    selectedDeptIds: number[];
    setSelectedDeptIds: (ids: number[]) => void;
    selectedGrades: number[];
    setSelectedGrades: (grades: number[]) => void;
    disabled?: boolean;
}

const GRADES = [1, 2, 3, 4];

export function TargetSelector({
    targetType,
    setTargetType,
    selectedDeptIds,
    setSelectedDeptIds,
    selectedGrades,
    setSelectedGrades,
    disabled
}: Props) {
    const t = useI18n("survey.admin.targetSelector");
    const { options: deptOptions } = useDeptsDropdownOptions();

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
        return deptOptions.find(o => o.value === String(id))?.label || t("deptFallback", { id });
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
                        disabled={disabled}
                    />
                    {t("targetType.ALL")}
                </label>
                <label className={styles.radioLabel}>
                    <input
                        type="radio"
                        name="targetType"
                        checked={targetType === "DEPT"}
                        onChange={() => setTargetType("DEPT")}
                        disabled={disabled}
                    />
                    {t("targetType.DEPT")}
                </label>
                <label className={styles.radioLabel}>
                    <input
                        type="radio"
                        name="targetType"
                        checked={targetType === "GRADE"}
                        onChange={() => setTargetType("GRADE")}
                        disabled={disabled}
                    />
                    {t("targetType.GRADE")}
                </label>
                <label className={styles.radioLabel}>
                    <input
                        type="radio"
                        name="targetType"
                        checked={targetType === "DEPT_GRADE"}
                        onChange={() => setTargetType("DEPT_GRADE")}
                        disabled={disabled}
                    />
                    {t("targetType.DEPT_GRADE")}
                </label>
            </div>

            {(targetType === "DEPT" || targetType === "DEPT_GRADE") && (
                <div className={styles.selectionArea}>
                    <p className={styles.guideText}>
                        {targetType === "DEPT_GRADE" ? t("guides.deptStep1") : t("guides.dept")}
                    </p>

                    <div style={{ maxWidth: '300px', marginBottom: '12px', opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
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
                                onClick={() => !disabled && removeDept(deptId)}
                                disabled={disabled}
                            >
                                {getDeptName(deptId)} {disabled ? '' : '✕'}
                            </button>
                        ))}
                        {selectedDeptIds.length === 0 && (
                            <span className="text-sm text-gray-400">{t("noDeptSelected")}</span>
                        )}
                    </div>
                </div>
            )}

            {(targetType === "GRADE" || targetType === "DEPT_GRADE") && (
                <div className={styles.selectionArea}>
                    <p className={styles.guideText}>
                        {targetType === "DEPT_GRADE" ? t("guides.gradeStep2") : t("guides.grade")}
                    </p>
                    <div className={styles.chipGrid}>
                        {GRADES.map(grade => (
                            <button
                                key={grade}
                                type="button"
                                className={`${styles.chip} ${selectedGrades.includes(grade) ? styles.chipActive : ''}`}
                                onClick={() => !disabled && toggleGrade(grade)}
                                disabled={disabled}
                            >
                                {t("gradeLabel", { grade })}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
