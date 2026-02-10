-- V36__reset_curricular_extra_operational_data.sql
-- Reset curricular/extra-curricular operational + grade data.
-- Keep masters: curricular, extra_curricular, competency.

-- =========================
-- 0) Competency summaries
-- =========================
DELETE FROM semester_student_competency_summary;
DELETE FROM semester_competency_cohort_stat;

-- =========================
-- 1) Curricular (offerings/enrollments/competency maps)
-- =========================
DELETE FROM enrollment;
DELETE FROM curricular_offering_competency_map;
DELETE FROM curricular_offering;

-- =========================
-- 2) Extra-curricular (offerings/sessions/applications/completions/maps)
-- =========================
DELETE FROM extra_curricular_session_completion;
DELETE FROM extra_curricular_session_video;
DELETE FROM extra_curricular_session;
DELETE FROM extra_curricular_application;
DELETE FROM extra_curricular_offering_competency_map;
DELETE FROM extra_curricular_offering;

-- Legacy table (if it exists in older DB state)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'extra_curricular_competency_map'
  ) THEN
    EXECUTE 'DELETE FROM extra_curricular_competency_map';
  END IF;
END $$;
