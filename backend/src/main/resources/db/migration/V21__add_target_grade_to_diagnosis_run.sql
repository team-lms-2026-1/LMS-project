-- V21: Add target_grade to diagnosis_run
ALTER TABLE diagnosis_run ADD COLUMN target_grade INT;

COMMENT ON COLUMN diagnosis_run.target_grade IS '진단 대상 학년 (1~6)';



ALTER TABLE diagnosis_run ADD COLUMN dept_id BIGINT;

COMMENT ON COLUMN diagnosis_run.dept_id IS '진단 대상 학과 ID (null이면 전체)';

CREATE INDEX idx_diagnosis_run_dept_id ON diagnosis_run(dept_id);


-- Add max_score to semester_competency_cohort_stat

ALTER TABLE semester_competency_cohort_stat ADD COLUMN max_score NUMERIC NOT NULL DEFAULT 0;

COMMENT ON COLUMN semester_competency_cohort_stat.max_score IS '최고 점수';
