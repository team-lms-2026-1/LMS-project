-- Allow multiple diagnoses per semester by department
ALTER TABLE diagnosis_run DROP CONSTRAINT IF EXISTS uq_run_semester;

-- Unique per semester + department
CREATE UNIQUE INDEX IF NOT EXISTS uq_diagnosis_run_semester_dept
    ON diagnosis_run (semester_id, dept_id);

-- Only one "all departments" (dept_id is null) per semester
CREATE UNIQUE INDEX IF NOT EXISTS uq_diagnosis_run_semester_all
    ON diagnosis_run (semester_id)
    WHERE dept_id IS NULL;
