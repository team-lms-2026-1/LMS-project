-- Allow multiple diagnoses per semester by department/grade
ALTER TABLE diagnosis_run DROP CONSTRAINT IF EXISTS uq_run_semester;

DROP INDEX IF EXISTS uq_diagnosis_run_semester_dept;
DROP INDEX IF EXISTS uq_diagnosis_run_semester_all;
DROP INDEX IF EXISTS uq_diagnosis_run_semester_dept_grade;
DROP INDEX IF EXISTS uq_diagnosis_run_semester_all_grade;

-- Unique per semester + department + grade (treat NULL as 0 = "all grades")
CREATE UNIQUE INDEX IF NOT EXISTS uq_diagnosis_run_semester_dept_grade
    ON diagnosis_run (semester_id, dept_id, COALESCE(target_grade, 0));

-- Only one "all departments" (dept_id is null) per semester + grade
CREATE UNIQUE INDEX IF NOT EXISTS uq_diagnosis_run_semester_all_grade
    ON diagnosis_run (semester_id, COALESCE(target_grade, 0))
    WHERE dept_id IS NULL;
