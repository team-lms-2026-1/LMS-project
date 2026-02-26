-- =====================================================
-- V63__seed_competency_2022_cs_ee.sql
-- Seed: 2022-1/2 CS & EE grade-1 competency evaluation data
-- =====================================================

-- 0) Ensure target semesters exist (idempotent)
INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES
  (2022, 'FIRST',  '2022-03-01', '2022-06-30', 'ACTIVE', '2022-1'),
  (2022, 'SECOND', '2022-09-01', '2022-12-24', 'ACTIVE', '2022-2')
ON CONFLICT (year, term) DO NOTHING;

-- =====================================================
-- 1) Diagnosis Runs (per dept + grade + semester)
-- =====================================================
WITH target_semesters AS (
  SELECT semester_id, term
  FROM semester
  WHERE year = 2022 AND term IN ('FIRST', 'SECOND')
),
 target_depts AS (
  SELECT dept_id, dept_code
  FROM dept
  WHERE dept_code IN ('CS', 'EE')
 )
INSERT INTO diagnosis_run (semester_id, title, start_at, end_at, status, target_grade, dept_id)
SELECT
  ts.semester_id,
  CONCAT('2022 ', td.dept_code, ' G1 Diagnosis ', CASE ts.term WHEN 'FIRST' THEN '1' ELSE '2' END),
  CASE ts.term
    WHEN 'FIRST' THEN TIMESTAMP '2022-03-01 09:00:00'
    ELSE TIMESTAMP '2022-09-01 09:00:00'
  END,
  CASE ts.term
    WHEN 'FIRST' THEN TIMESTAMP '2022-06-30 23:59:59'
    ELSE TIMESTAMP '2022-12-24 23:59:59'
  END,
  'CLOSED',
  1,
  td.dept_id
FROM target_semesters ts
CROSS JOIN target_depts td
WHERE NOT EXISTS (
  SELECT 1
  FROM diagnosis_run dr
  WHERE dr.semester_id = ts.semester_id
    AND dr.dept_id = td.dept_id
    AND COALESCE(dr.target_grade, 0) = 1
);

-- =====================================================
-- 2) Diagnosis Questions (SCALE 10 + SHORT 10, weights 1~5)
-- =====================================================
WITH target_runs AS (
  SELECT r.run_id
  FROM diagnosis_run r
  JOIN semester s ON r.semester_id = s.semester_id
  JOIN dept d ON r.dept_id = d.dept_id
  WHERE s.year = 2022 AND s.term IN ('FIRST', 'SECOND')
    AND d.dept_code IN ('CS', 'EE')
    AND COALESCE(r.target_grade, 0) = 1
),
question_rows AS (
  SELECT
    tr.run_id,
    g.n AS sort_order,
    CASE WHEN g.n <= 10 THEN 'SCALE' ELSE 'SHORT' END AS question_type,
    CASE
      WHEN g.n IN (1,2,3,4,5,11,12,13,14,15) THEN 'SKILL'
      ELSE 'APTITUDE'
    END AS domain,
    CONCAT('Q', g.n, ' - 6Cs') AS content,
    CASE WHEN g.n <= 10 THEN 'SCALE' ELSE 'SHORT' END AS section_title
  FROM target_runs tr
  CROSS JOIN generate_series(1, 20) AS g(n)
)
INSERT INTO diagnosis_question (
  run_id, domain, question_type, content, section_title, sort_order,
  short_answer_key,
  c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score,
  label1, label2, label3, label4, label5,
  score1, score2, score3, score4, score5
)
SELECT
  qr.run_id,
  qr.domain,
  qr.question_type,
  qr.content,
  qr.section_title,
  qr.sort_order,
  CASE WHEN qr.question_type = 'SHORT' THEN 'A' ELSE NULL END,
  5, 5, 5, 5, 5, 5,
  CASE WHEN qr.question_type = 'SCALE' THEN '1' ELSE NULL END,
  CASE WHEN qr.question_type = 'SCALE' THEN '2' ELSE NULL END,
  CASE WHEN qr.question_type = 'SCALE' THEN '3' ELSE NULL END,
  CASE WHEN qr.question_type = 'SCALE' THEN '4' ELSE NULL END,
  CASE WHEN qr.question_type = 'SCALE' THEN '5' ELSE NULL END,
  CASE WHEN qr.question_type = 'SCALE' THEN 1 ELSE NULL END,
  CASE WHEN qr.question_type = 'SCALE' THEN 2 ELSE NULL END,
  CASE WHEN qr.question_type = 'SCALE' THEN 3 ELSE NULL END,
  CASE WHEN qr.question_type = 'SCALE' THEN 4 ELSE NULL END,
  CASE WHEN qr.question_type = 'SCALE' THEN 5 ELSE NULL END
FROM question_rows qr
ON CONFLICT (run_id, sort_order) DO NOTHING;

-- =====================================================
-- 3) Diagnosis Targets / Submissions / Answers
-- =====================================================
WITH target_depts AS (
  SELECT dept_id, dept_code
  FROM dept
  WHERE dept_code IN ('CS', 'EE')
 ),
 target_students AS (
  SELECT sp.account_id, sp.dept_id, d.dept_code
  FROM student_profile sp
  JOIN dept d ON sp.dept_id = d.dept_id
  WHERE d.dept_code IN ('CS', 'EE')
    AND sp.grade_level = 1
    AND sp.academic_status = 'ENROLLED'
 ),
 target_runs AS (
  SELECT r.run_id, r.dept_id
  FROM diagnosis_run r
  JOIN semester s ON r.semester_id = s.semester_id
  WHERE s.year = 2022 AND s.term IN ('FIRST', 'SECOND')
    AND r.dept_id IN (SELECT dept_id FROM target_depts)
    AND COALESCE(r.target_grade, 0) = 1
 )
INSERT INTO diagnosis_target (run_id, student_account_id, status)
SELECT r.run_id, s.account_id, 'SUBMITTED'
FROM target_runs r
JOIN target_students s ON s.dept_id = r.dept_id
ON CONFLICT (run_id, student_account_id) DO NOTHING;

WITH target_students AS (
  SELECT sp.account_id, sp.dept_id
  FROM student_profile sp
  JOIN dept d ON sp.dept_id = d.dept_id
  WHERE d.dept_code IN ('CS', 'EE')
    AND sp.grade_level = 1
    AND sp.academic_status = 'ENROLLED'
 ),
 target_runs AS (
  SELECT r.run_id, r.dept_id, r.start_at
  FROM diagnosis_run r
  JOIN semester s ON r.semester_id = s.semester_id
  WHERE s.year = 2022 AND s.term IN ('FIRST', 'SECOND')
    AND COALESCE(r.target_grade, 0) = 1
 )
INSERT INTO diagnosis_submission (run_id, student_account_id, submitted_at)
SELECT r.run_id, s.account_id, r.start_at + INTERVAL '10 days'
FROM target_runs r
JOIN target_students s ON s.dept_id = r.dept_id
ON CONFLICT (run_id, student_account_id) DO NOTHING;

WITH target_students AS (
  SELECT sp.account_id,
         d.dept_code,
         CASE WHEN d.dept_code = 'EE' THEN 1 ELSE 0 END AS dept_offset,
         ROW_NUMBER() OVER (ORDER BY sp.account_id) AS student_idx
  FROM student_profile sp
  JOIN dept d ON sp.dept_id = d.dept_id
  WHERE d.dept_code IN ('CS', 'EE')
    AND sp.grade_level = 1
    AND sp.academic_status = 'ENROLLED'
 ),
 semester_indexed AS (
  SELECT semester_id,
         CASE WHEN term = 'FIRST' THEN 1 ELSE 2 END AS semester_idx
  FROM semester
  WHERE year = 2022 AND term IN ('FIRST', 'SECOND')
 )
INSERT INTO diagnosis_answer (submission_id, question_id, scale_value, is_correct)
SELECT
  ds.submission_id,
  q.question_id,
  CASE
    WHEN q.question_type = 'SCALE'
      THEN ((ts.student_idx + q.sort_order + si.semester_idx + ts.dept_offset) % 5) + 1
    ELSE NULL
  END AS scale_value,
  CASE
    WHEN q.question_type = 'SHORT'
      THEN ((ts.student_idx + q.sort_order + si.semester_idx + ts.dept_offset) % 2) = 0
    ELSE NULL
  END AS is_correct
FROM diagnosis_submission ds
JOIN diagnosis_run r ON ds.run_id = r.run_id
JOIN semester_indexed si ON r.semester_id = si.semester_id
JOIN target_students ts ON ds.student_account_id = ts.account_id
JOIN diagnosis_question q ON q.run_id = r.run_id
ON CONFLICT (submission_id, question_id) DO NOTHING;

-- =====================================================
-- 4) Curricular (Offerings + Enrollment)
-- =====================================================
INSERT INTO curricular_offering (
  offering_code, curricular_id, semester_id, day_of_week, period,
  capacity, location, professor_account_id, status
)
SELECT
  c.curricular_code || '-2022-1',
  c.curricular_id,
  s.semester_id,
  'MONDAY',
  1,
  40,
  'A-101',
  a.account_id,
  'COMPLETED'
FROM curricular c
JOIN semester s ON s.year = 2022 AND s.term = 'FIRST'
JOIN account a ON a.login_id = CASE
  WHEN c.curricular_code = 'CS101' THEN 'p199900011'
  WHEN c.curricular_code = 'EE101' THEN 'p19990003'
  ELSE 'p199900011'
END
WHERE c.curricular_code IN ('CS101', 'EE101')
ON CONFLICT (offering_code) DO NOTHING;

INSERT INTO curricular_offering (
  offering_code, curricular_id, semester_id, day_of_week, period,
  capacity, location, professor_account_id, status
)
SELECT
  c.curricular_code || '-2022-2',
  c.curricular_id,
  s.semester_id,
  'TUESDAY',
  2,
  40,
  'B-202',
  a.account_id,
  'COMPLETED'
FROM curricular c
JOIN semester s ON s.year = 2022 AND s.term = 'SECOND'
JOIN account a ON a.login_id = CASE
  WHEN c.curricular_code = 'CS101' THEN 'p199900011'
  WHEN c.curricular_code = 'EE101' THEN 'p19990003'
  ELSE 'p199900011'
END
WHERE c.curricular_code IN ('CS101', 'EE101')
ON CONFLICT (offering_code) DO NOTHING;

INSERT INTO curricular_offering_competency_map (offering_id, competency_id, weight)
SELECT
  co.offering_id,
  comp.competency_id,
  CASE comp.code
    WHEN 'C1' THEN 6
    WHEN 'C2' THEN 5
    WHEN 'C3' THEN 4
    WHEN 'C4' THEN 3
    WHEN 'C5' THEN 2
    WHEN 'C6' THEN 1
  END
FROM curricular_offering co
JOIN curricular c ON co.curricular_id = c.curricular_id
JOIN semester s ON co.semester_id = s.semester_id
CROSS JOIN competency comp
WHERE s.year = 2022 AND s.term IN ('FIRST', 'SECOND')
  AND c.curricular_code IN ('CS101', 'EE101')
  AND comp.code IN ('C1','C2','C3','C4','C5','C6')
ON CONFLICT (offering_id, competency_id) DO NOTHING;

WITH target_students AS (
  SELECT sp.account_id,
         sp.dept_id,
         d.dept_code,
         CASE WHEN d.dept_code = 'EE' THEN 5 ELSE 0 END AS dept_offset,
         ROW_NUMBER() OVER (ORDER BY sp.account_id) AS student_idx
  FROM student_profile sp
  JOIN dept d ON sp.dept_id = d.dept_id
  WHERE d.dept_code IN ('CS', 'EE')
    AND sp.grade_level = 1
    AND sp.academic_status = 'ENROLLED'
 ),
 offerings_2022 AS (
  SELECT co.offering_id, co.semester_id, d.dept_id,
         CASE WHEN s.term = 'FIRST' THEN 1 ELSE 2 END AS semester_idx
  FROM curricular_offering co
  JOIN curricular c ON co.curricular_id = c.curricular_id
  JOIN dept d ON c.dept_id = d.dept_id
  JOIN semester s ON co.semester_id = s.semester_id
  WHERE s.year = 2022 AND s.term IN ('FIRST', 'SECOND')
    AND c.curricular_code IN ('CS101', 'EE101')
 )
INSERT INTO enrollment (
  offering_id, student_account_id, enrollment_status, completion_status,
  raw_score, grade, is_grade_confirmed, applied_at, created_at, updated_at
)
SELECT
  o.offering_id,
  ts.account_id,
  'ENROLLED',
  'PASSED',
  LEAST(100, 60 + ts.student_idx * 3 + o.semester_idx * 2 + ts.dept_offset),
  'A',
  true,
  now(), now(), now()
FROM offerings_2022 o
JOIN target_students ts ON ts.dept_id = o.dept_id
ON CONFLICT (offering_id, student_account_id) DO UPDATE
SET raw_score = EXCLUDED.raw_score,
    completion_status = 'PASSED',
    enrollment_status = 'ENROLLED',
    is_grade_confirmed = true,
    updated_at = now();

-- =====================================================
-- 5) Extra-curricular (Offerings + Applications + Completions)
-- =====================================================
INSERT INTO extra_curricular (
  extra_curricular_code, extra_curricular_name, description,
  host_org_name, is_active, created_at, updated_at
)
VALUES
  ('EC_CS_2022', 'CS Activity 2022', 'CS extra program', 'CS Dept', true, now(), now()),
  ('EC_EE_2022', 'EE Activity 2022', 'EE extra program', 'EE Dept', true, now(), now())
ON CONFLICT (extra_curricular_code) DO NOTHING;

INSERT INTO extra_curricular_offering (
  extra_curricular_id, extra_offering_code, extra_offering_name,
  host_contact_name, reward_point_default, recognized_hours_default,
  semester_id, operation_start_at, operation_end_at, status, created_at, updated_at
)
SELECT ec.extra_curricular_id, 'ECO_CS_2022_1', 'CS Activity 2022-1', 'CS Office', 12, 4,
       s.semester_id, '2022-03-01', '2022-06-30', 'COMPLETED', now(), now()
FROM extra_curricular ec, semester s
WHERE ec.extra_curricular_code = 'EC_CS_2022' AND s.year = 2022 AND s.term = 'FIRST'
ON CONFLICT (extra_offering_code) DO NOTHING;

INSERT INTO extra_curricular_offering (
  extra_curricular_id, extra_offering_code, extra_offering_name,
  host_contact_name, reward_point_default, recognized_hours_default,
  semester_id, operation_start_at, operation_end_at, status, created_at, updated_at
)
SELECT ec.extra_curricular_id, 'ECO_CS_2022_2', 'CS Activity 2022-2', 'CS Office', 14, 5,
       s.semester_id, '2022-09-01', '2022-12-24', 'COMPLETED', now(), now()
FROM extra_curricular ec, semester s
WHERE ec.extra_curricular_code = 'EC_CS_2022' AND s.year = 2022 AND s.term = 'SECOND'
ON CONFLICT (extra_offering_code) DO NOTHING;

INSERT INTO extra_curricular_offering (
  extra_curricular_id, extra_offering_code, extra_offering_name,
  host_contact_name, reward_point_default, recognized_hours_default,
  semester_id, operation_start_at, operation_end_at, status, created_at, updated_at
)
SELECT ec.extra_curricular_id, 'ECO_EE_2022_1', 'EE Activity 2022-1', 'EE Office', 11, 4,
       s.semester_id, '2022-03-01', '2022-06-30', 'COMPLETED', now(), now()
FROM extra_curricular ec, semester s
WHERE ec.extra_curricular_code = 'EC_EE_2022' AND s.year = 2022 AND s.term = 'FIRST'
ON CONFLICT (extra_offering_code) DO NOTHING;

INSERT INTO extra_curricular_offering (
  extra_curricular_id, extra_offering_code, extra_offering_name,
  host_contact_name, reward_point_default, recognized_hours_default,
  semester_id, operation_start_at, operation_end_at, status, created_at, updated_at
)
SELECT ec.extra_curricular_id, 'ECO_EE_2022_2', 'EE Activity 2022-2', 'EE Office', 13, 5,
       s.semester_id, '2022-09-01', '2022-12-24', 'COMPLETED', now(), now()
FROM extra_curricular ec, semester s
WHERE ec.extra_curricular_code = 'EC_EE_2022' AND s.year = 2022 AND s.term = 'SECOND'
ON CONFLICT (extra_offering_code) DO NOTHING;

INSERT INTO extra_curricular_session (
  extra_offering_id, session_name, start_at, end_at,
  status, reward_point, recognized_hours, created_at, updated_at
)
SELECT
  eco.extra_offering_id,
  'Session 1',
  eco.operation_start_at + INTERVAL '14 days',
  eco.operation_start_at + INTERVAL '14 days 02:00:00',
  'CLOSED',
  eco.reward_point_default,
  eco.recognized_hours_default,
  now(), now()
FROM extra_curricular_offering eco
JOIN semester s ON eco.semester_id = s.semester_id
WHERE s.year = 2022 AND s.term IN ('FIRST', 'SECOND')
  AND eco.extra_offering_code LIKE 'ECO_%_2022_%'
ON CONFLICT (extra_offering_id, session_name) DO NOTHING;

INSERT INTO extra_curricular_offering_competency_map (
  extra_offering_id, competency_id, weight, created_at, updated_at
)
SELECT
  eco.extra_offering_id,
  comp.competency_id,
  CASE comp.code
    WHEN 'C1' THEN 1
    WHEN 'C2' THEN 2
    WHEN 'C3' THEN 3
    WHEN 'C4' THEN 4
    WHEN 'C5' THEN 5
    WHEN 'C6' THEN 6
  END,
  now(), now()
FROM extra_curricular_offering eco
JOIN semester s ON eco.semester_id = s.semester_id
CROSS JOIN competency comp
WHERE s.year = 2022 AND s.term IN ('FIRST', 'SECOND')
  AND eco.extra_offering_code LIKE 'ECO_%_2022_%'
  AND comp.code IN ('C1','C2','C3','C4','C5','C6')
ON CONFLICT (extra_offering_id, competency_id) DO NOTHING;

WITH target_students AS (
  SELECT sp.account_id, d.dept_code
  FROM student_profile sp
  JOIN dept d ON sp.dept_id = d.dept_id
  WHERE d.dept_code IN ('CS', 'EE')
    AND sp.grade_level = 1
    AND sp.academic_status = 'ENROLLED'
 ),
 extra_offerings AS (
  SELECT eco.extra_offering_id, eco.operation_start_at, eco.operation_end_at,
         CASE
           WHEN ec.extra_curricular_code = 'EC_CS_2022' THEN 'CS'
           WHEN ec.extra_curricular_code = 'EC_EE_2022' THEN 'EE'
         END AS dept_code
  FROM extra_curricular_offering eco
  JOIN extra_curricular ec ON eco.extra_curricular_id = ec.extra_curricular_id
  JOIN semester s ON eco.semester_id = s.semester_id
  WHERE s.year = 2022 AND s.term IN ('FIRST', 'SECOND')
    AND ec.extra_curricular_code IN ('EC_CS_2022', 'EC_EE_2022')
 )
INSERT INTO extra_curricular_application (
  extra_offering_id, student_account_id, apply_status,
  completion_status, passed_at, applied_at, created_at, updated_at
)
SELECT
  eo.extra_offering_id,
  ts.account_id,
  'APPLIED',
  'PASSED',
  eo.operation_end_at,
  eo.operation_start_at,
  now(), now()
FROM extra_offerings eo
JOIN target_students ts ON ts.dept_code = eo.dept_code
ON CONFLICT (extra_offering_id, student_account_id) DO UPDATE
SET apply_status = 'APPLIED',
    completion_status = 'PASSED',
    passed_at = EXCLUDED.passed_at,
    updated_at = now();

WITH student_indexed AS (
  SELECT sp.account_id,
         d.dept_code,
         CASE WHEN d.dept_code = 'EE' THEN 1 ELSE 0 END AS dept_offset,
         ROW_NUMBER() OVER (ORDER BY sp.account_id) AS student_idx
  FROM student_profile sp
  JOIN dept d ON sp.dept_id = d.dept_id
  WHERE d.dept_code IN ('CS', 'EE')
    AND sp.grade_level = 1
    AND sp.academic_status = 'ENROLLED'
 ),
 extra_sessions AS (
  SELECT ecs.session_id, ecs.extra_offering_id,
         CASE WHEN s.term = 'FIRST' THEN 1 ELSE 2 END AS semester_idx,
         CASE
           WHEN ec.extra_curricular_code = 'EC_EE_2022' THEN 1
           ELSE 0
         END AS dept_offset
  FROM extra_curricular_session ecs
  JOIN extra_curricular_offering eco ON ecs.extra_offering_id = eco.extra_offering_id
  JOIN extra_curricular ec ON eco.extra_curricular_id = ec.extra_curricular_id
  JOIN semester s ON eco.semester_id = s.semester_id
  WHERE s.year = 2022 AND s.term IN ('FIRST', 'SECOND')
    AND ec.extra_curricular_code IN ('EC_CS_2022', 'EC_EE_2022')
 )
INSERT INTO extra_curricular_session_completion (
  session_id, application_id, is_attended, attended_at,
  earned_point, earned_hours, watched_seconds, created_at, updated_at
)
SELECT
  es.session_id,
  eca.application_id,
  true,
  now(),
  (5 + si.student_idx * 2 + es.semester_idx + es.dept_offset),
  2,
  3600,
  now(), now()
FROM extra_sessions es
JOIN extra_curricular_application eca ON eca.extra_offering_id = es.extra_offering_id
JOIN student_indexed si ON eca.student_account_id = si.account_id
ON CONFLICT (session_id, application_id) DO UPDATE
SET is_attended = true,
    earned_point = EXCLUDED.earned_point,
    earned_hours = EXCLUDED.earned_hours,
    watched_seconds = EXCLUDED.watched_seconds,
    updated_at = now();

-- =====================================================
-- 5-6) Force top scorer per dept (CS/EE)
-- =====================================================
WITH top_students AS (
  SELECT d.dept_code, MIN(sp.account_id) AS account_id
  FROM student_profile sp
  JOIN dept d ON sp.dept_id = d.dept_id
  WHERE d.dept_code IN ('CS', 'EE')
    AND sp.grade_level = 1
    AND sp.academic_status = 'ENROLLED'
  GROUP BY d.dept_code
),
target_submissions AS (
  SELECT ds.submission_id
  FROM diagnosis_submission ds
  JOIN diagnosis_run r ON ds.run_id = r.run_id
  JOIN semester s ON r.semester_id = s.semester_id
  JOIN top_students ts ON ds.student_account_id = ts.account_id
  WHERE s.year = 2022
    AND s.term IN ('FIRST', 'SECOND')
    AND COALESCE(r.target_grade, 0) = 1
)
UPDATE diagnosis_answer da
SET scale_value = CASE WHEN q.question_type = 'SCALE' THEN 1 ELSE da.scale_value END,
    is_correct = CASE WHEN q.question_type = 'SHORT' THEN true ELSE da.is_correct END
FROM target_submissions ts,
     diagnosis_question q
WHERE da.submission_id = ts.submission_id
  AND q.question_id = da.question_id;

WITH top_students AS (
  SELECT d.dept_code, MIN(sp.account_id) AS account_id
  FROM student_profile sp
  JOIN dept d ON sp.dept_id = d.dept_id
  WHERE d.dept_code IN ('CS', 'EE')
    AND sp.grade_level = 1
    AND sp.academic_status = 'ENROLLED'
  GROUP BY d.dept_code
),
target_enrollments AS (
  SELECT e.enrollment_id
  FROM enrollment e
  JOIN curricular_offering co ON e.offering_id = co.offering_id
  JOIN semester s ON co.semester_id = s.semester_id
  JOIN top_students ts ON e.student_account_id = ts.account_id
  WHERE s.year = 2022
    AND s.term IN ('FIRST', 'SECOND')
)
UPDATE enrollment e
SET raw_score = 100,
    grade = 'A+',
    completion_status = 'PASSED',
    enrollment_status = 'ENROLLED',
    is_grade_confirmed = true,
    updated_at = now()
FROM target_enrollments te
WHERE e.enrollment_id = te.enrollment_id;

WITH top_students AS (
  SELECT d.dept_code, MIN(sp.account_id) AS account_id
  FROM student_profile sp
  JOIN dept d ON sp.dept_id = d.dept_id
  WHERE d.dept_code IN ('CS', 'EE')
    AND sp.grade_level = 1
    AND sp.academic_status = 'ENROLLED'
  GROUP BY d.dept_code
),
target_completions AS (
  SELECT esc.completion_id, ts.dept_code
  FROM extra_curricular_session_completion esc
  JOIN extra_curricular_application eca ON esc.application_id = eca.application_id
  JOIN extra_curricular_offering eco ON eca.extra_offering_id = eco.extra_offering_id
  JOIN semester s ON eco.semester_id = s.semester_id
  JOIN top_students ts ON eca.student_account_id = ts.account_id
  WHERE s.year = 2022
    AND s.term IN ('FIRST', 'SECOND')
)
UPDATE extra_curricular_session_completion esc
SET is_attended = true,
    earned_point = CASE target_completions.dept_code WHEN 'CS' THEN 50 ELSE 55 END,
    earned_hours = 8,
    watched_seconds = 14400,
    updated_at = now()
FROM target_completions
WHERE esc.completion_id = target_completions.completion_id;

-- =====================================================
-- 6) Summary (semester_student_competency_summary)
-- =====================================================
WITH target_semesters AS (
  SELECT semester_id
  FROM semester
  WHERE year = 2022 AND term IN ('FIRST', 'SECOND')
 ),
 target_students AS (
  SELECT sp.account_id
  FROM student_profile sp
  JOIN dept d ON sp.dept_id = d.dept_id
  WHERE d.dept_code IN ('CS', 'EE')
    AND sp.grade_level = 1
    AND sp.academic_status = 'ENROLLED'
 ),
 competencies AS (
  SELECT competency_id, code
  FROM competency
  WHERE code IN ('C1','C2','C3','C4','C5','C6')
 ),
 base_rows AS (
  SELECT ts.semester_id, st.account_id AS student_account_id, c.competency_id, c.code
  FROM target_semesters ts
  CROSS JOIN target_students st
  CROSS JOIN competencies c
 ),
 diag_raw AS (
  SELECT
    r.semester_id,
    ds.student_account_id,
    c.competency_id,
    q.domain,
    SUM(
      (
        CASE q.question_type
          WHEN 'SCALE' THEN
            CASE ds_ans.scale_value
              WHEN 5 THEN COALESCE(q.score1, 5)
              WHEN 4 THEN COALESCE(q.score2, 4)
              WHEN 3 THEN COALESCE(q.score3, 3)
              WHEN 2 THEN COALESCE(q.score4, 2)
              WHEN 1 THEN COALESCE(q.score5, 1)
              ELSE 0
            END
          WHEN 'SHORT' THEN CASE WHEN ds_ans.is_correct THEN 1 ELSE 0 END
          ELSE 0
        END
        *
        CASE c.code
          WHEN 'C1' THEN q.c1_max_score
          WHEN 'C2' THEN q.c2_max_score
          WHEN 'C3' THEN q.c3_max_score
          WHEN 'C4' THEN q.c4_max_score
          WHEN 'C5' THEN q.c5_max_score
          WHEN 'C6' THEN q.c6_max_score
          ELSE 0
        END
      )
    )::numeric AS score
  FROM diagnosis_answer ds_ans
  JOIN diagnosis_submission ds ON ds_ans.submission_id = ds.submission_id
  JOIN diagnosis_run r ON ds.run_id = r.run_id
  JOIN diagnosis_question q ON ds_ans.question_id = q.question_id
  JOIN competencies c ON true
  JOIN target_semesters ts ON r.semester_id = ts.semester_id
  WHERE COALESCE(r.target_grade, 0) = 1
  GROUP BY r.semester_id, ds.student_account_id, c.competency_id, q.domain
 ),
 diag_scores AS (
  SELECT
    semester_id,
    student_account_id,
    competency_id,
    SUM(CASE WHEN domain = 'SKILL' THEN score ELSE 0 END) AS diag_skill_raw,
    SUM(CASE WHEN domain = 'APTITUDE' THEN score ELSE 0 END) AS diag_apt_raw
  FROM diag_raw
  GROUP BY semester_id, student_account_id, competency_id
 ),
 curr_scores AS (
  SELECT
    co.semester_id,
    e.student_account_id,
    m.competency_id,
    SUM(COALESCE(e.raw_score, 0) * m.weight)::numeric AS curricular_score
  FROM enrollment e
  JOIN curricular_offering co ON e.offering_id = co.offering_id
  JOIN curricular_offering_competency_map m ON m.offering_id = co.offering_id
  JOIN target_semesters ts ON co.semester_id = ts.semester_id
  WHERE e.student_account_id IN (SELECT account_id FROM target_students)
  GROUP BY co.semester_id, e.student_account_id, m.competency_id
 ),
 extra_scores AS (
  SELECT
    eco.semester_id,
    eca.student_account_id,
    m.competency_id,
    SUM(esc.earned_point * m.weight)::numeric AS extra_raw
  FROM extra_curricular_session_completion esc
  JOIN extra_curricular_application eca ON esc.application_id = eca.application_id
  JOIN extra_curricular_offering eco ON eca.extra_offering_id = eco.extra_offering_id
  JOIN extra_curricular_offering_competency_map m ON m.extra_offering_id = eco.extra_offering_id
  JOIN target_semesters ts ON eco.semester_id = ts.semester_id
  WHERE eca.student_account_id IN (SELECT account_id FROM target_students)
  GROUP BY eco.semester_id, eca.student_account_id, m.competency_id
 )
INSERT INTO semester_student_competency_summary (
  semester_id, student_account_id, competency_id,
  diagnosis_skill_score, diagnosis_aptitude_score, diagnosis_score,
  curricular_score, extra_score, self_extra_score, total_score,
  calculated_at, created_at, updated_at
)
SELECT
  b.semester_id,
  b.student_account_id,
  b.competency_id,
  COALESCE(d.diag_skill_raw, 0) * 10,
  COALESCE(d.diag_apt_raw, 0) * 10,
  (COALESCE(d.diag_skill_raw, 0) + COALESCE(d.diag_apt_raw, 0)) * 10,
  COALESCE(cu.curricular_score, 0),
  COALESCE(ex.extra_raw, 0) * 10,
  0,
  (COALESCE(d.diag_skill_raw, 0) + COALESCE(d.diag_apt_raw, 0)) * 10
    + COALESCE(cu.curricular_score, 0)
    + COALESCE(ex.extra_raw, 0) * 10,
  now(), now(), now()
FROM base_rows b
LEFT JOIN diag_scores d
  ON d.semester_id = b.semester_id
 AND d.student_account_id = b.student_account_id
 AND d.competency_id = b.competency_id
LEFT JOIN curr_scores cu
  ON cu.semester_id = b.semester_id
 AND cu.student_account_id = b.student_account_id
 AND cu.competency_id = b.competency_id
LEFT JOIN extra_scores ex
  ON ex.semester_id = b.semester_id
 AND ex.student_account_id = b.student_account_id
 AND ex.competency_id = b.competency_id
ON CONFLICT (semester_id, student_account_id, competency_id) DO UPDATE
SET diagnosis_skill_score = EXCLUDED.diagnosis_skill_score,
    diagnosis_aptitude_score = EXCLUDED.diagnosis_aptitude_score,
    diagnosis_score = EXCLUDED.diagnosis_score,
    curricular_score = EXCLUDED.curricular_score,
    extra_score = EXCLUDED.extra_score,
    self_extra_score = EXCLUDED.self_extra_score,
    total_score = EXCLUDED.total_score,
    calculated_at = EXCLUDED.calculated_at,
    updated_at = now();

-- =====================================================
-- 7) Cohort Stats (semester_competency_cohort_stat)
-- =====================================================
WITH target_semesters AS (
  SELECT semester_id
  FROM semester
  WHERE year = 2022 AND term IN ('FIRST', 'SECOND')
 ),
 target_students AS (
  SELECT sp.account_id
  FROM student_profile sp
  JOIN dept d ON sp.dept_id = d.dept_id
  WHERE d.dept_code IN ('CS', 'EE')
    AND sp.grade_level = 1
    AND sp.academic_status = 'ENROLLED'
 ),
 target_count AS (
  SELECT COUNT(*)::int AS cnt FROM target_students
 )
INSERT INTO semester_competency_cohort_stat (
  semester_id, competency_id, target_count, calculated_count,
  mean, median, stddev, max_score, calculated_at, created_at, updated_at
)
SELECT
  s.semester_id,
  s.competency_id,
  tc.cnt,
  COUNT(*)::int,
  COALESCE(AVG(s.total_score), 0),
  COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY s.total_score), 0),
  COALESCE(STDDEV_POP(s.total_score), 0),
  COALESCE(MAX(s.total_score), 0),
  now(), now(), now()
FROM semester_student_competency_summary s
JOIN target_semesters ts ON s.semester_id = ts.semester_id
CROSS JOIN target_count tc
GROUP BY s.semester_id, s.competency_id, tc.cnt
ON CONFLICT (semester_id, competency_id) DO UPDATE
SET target_count = EXCLUDED.target_count,
    calculated_count = EXCLUDED.calculated_count,
    mean = EXCLUDED.mean,
    median = EXCLUDED.median,
    stddev = EXCLUDED.stddev,
    max_score = EXCLUDED.max_score,
    calculated_at = EXCLUDED.calculated_at,
    updated_at = now();
