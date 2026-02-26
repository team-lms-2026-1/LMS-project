-- ==========================================
-- EE 1학년 학생 2명 추가 시드 (20240013, 20240014)
-- 비밀번호 해시: 기존 시드와 동일 (abc12345)
-- ==========================================

INSERT INTO account (login_id, password_hash, account_type, status, created_at, updated_at)
VALUES
  ('s20240013', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'STUDENT', 'ACTIVE', now(), now()),
  ('s20240014', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'STUDENT', 'ACTIVE', now(), now())
ON CONFLICT (login_id) DO NOTHING;

INSERT INTO student_profile (
  account_id, student_no, name, email, phone, grade_level, academic_status, dept_id, created_at, updated_at
)
SELECT
  a.account_id, '20240013', '이학생13', 'student13@example.com', '010-0000-0013', 1, 'ENROLLED',
  (SELECT dept_id FROM dept WHERE dept_code = 'EE'),
  now(), now()
FROM account a WHERE a.login_id = 's20240013'
ON CONFLICT (account_id) DO NOTHING;

INSERT INTO student_profile (
  account_id, student_no, name, email, phone, grade_level, academic_status, dept_id, created_at, updated_at
)
SELECT
  a.account_id, '20240014', '이학생14', 'student14@example.com', '010-0000-0014', 1, 'ENROLLED',
  (SELECT dept_id FROM dept WHERE dept_code = 'EE'),
  now(), now()
FROM account a WHERE a.login_id = 's20240014'
ON CONFLICT (account_id) DO NOTHING;
