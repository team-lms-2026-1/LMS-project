-- ==========================================
-- 1. 학과 (dept) 
-- ==========================================

-- 학과 추가 (수학과, 물리학과)
INSERT INTO dept (dept_code, dept_name, description, is_active)
VALUES
  ('MATH', '수학과', '수학 전공', true),
  ('PHYS', '물리학과', '물리학 전공', true)
ON CONFLICT (dept_code) DO NOTHING;


-- 2. 전공 (major) 
-- 수업 추가 컴공 3개

INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'CS_AI_S1', '기초C프로그래밍', '기초 프로그래밍', 3, true
FROM dept d
WHERE d.dept_code = 'CS'
ON CONFLICT (major_code) DO NOTHING;

INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'CS_AI_S2', '전공의이해', '전공의 기본 이해', 4, true
FROM dept d
WHERE d.dept_code = 'CS'
ON CONFLICT (major_code) DO NOTHING;

INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'CS_AI_S3', '캡스톤디자인1', '팀 프로젝트', 5, true
FROM dept d
WHERE d.dept_code = 'CS'
ON CONFLICT (major_code) DO NOTHING;


-- 수업 추가 전자 4개
INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'EE_E1', '전력공학', '전력 전기 공학의 이해', 2, true
FROM dept d
WHERE d.dept_code = 'EE'
ON CONFLICT (major_code) DO NOTHING;

INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'EE_E2', '전자회로1', '전자회로의 이해', 3, true
FROM dept d
WHERE d.dept_code = 'EE'
ON CONFLICT (major_code) DO NOTHING;

INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'EE_E3', '전기기기1', '전자기기의 이해', 4, true
FROM dept d
WHERE d.dept_code = 'EE'
ON CONFLICT (major_code) DO NOTHING;

INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'EE_E4', '시퀀스제어', '시퀀스 제어의 이해', 5, true
FROM dept d
WHERE d.dept_code = 'EE'
ON CONFLICT (major_code) DO NOTHING;




-- 수업 추가 경영 4개
INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'BIZ_MGM1', '재무관리', '재무 관리의 이해', 2, true
FROM dept d
WHERE d.dept_code = 'BIZ'
ON CONFLICT (major_code) DO NOTHING;

INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'BIZ_MGM2', '서비스마케팅', '서비스마케팅의 이해', 3, true
FROM dept d
WHERE d.dept_code = 'BIZ'
ON CONFLICT (major_code) DO NOTHING;

INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'BIZ_MGM3', '경영분석', '경영분석의 이해', 4, true
FROM dept d
WHERE d.dept_code = 'BIZ'
ON CONFLICT (major_code) DO NOTHING;

INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'BIZ_MGM4', '인적자원관리', '인적자원관리의 이해', 5, true
FROM dept d
WHERE d.dept_code = 'BIZ'
ON CONFLICT (major_code) DO NOTHING;


-- 수학과 5개
INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'MATH_M1', '기초수학', '기초 수학의 이해', 1, true
FROM dept d
WHERE d.dept_code = 'MATH'
ON CONFLICT (major_code) DO NOTHING;

INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'MATH_M2', '선형대수', '선형대수의 이해', 2, true
FROM dept d
WHERE d.dept_code = 'MATH'
ON CONFLICT (major_code) DO NOTHING;

INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'MATH_M3', '확률과통계', '확률과통계의 이해', 3, true
FROM dept d
WHERE d.dept_code = 'MATH'
ON CONFLICT (major_code) DO NOTHING;

INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'MATH_M4', '미분방정식', '미분방정식의 이해', 4, true
FROM dept d
WHERE d.dept_code = 'MATH'
ON CONFLICT (major_code) DO NOTHING;

INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'MATH_M5', '확률분석', '확률분석의 이해', 5, true
FROM dept d
WHERE d.dept_code = 'MATH'
ON CONFLICT (major_code) DO NOTHING;

-- 물리학과 5개
INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'PHYS_P1', '기초물리', '기초물리의 이해', 1, true
FROM dept d
WHERE d.dept_code = 'PHYS'
ON CONFLICT (major_code) DO NOTHING;

INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'PHYS_P2', '유체역학', '유체역학의 이해', 2, true
FROM dept d
WHERE d.dept_code = 'PHYS'
ON CONFLICT (major_code) DO NOTHING;

INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'PHYS_P3', '전산물리', '전산물리의 이해', 3, true
FROM dept d
WHERE d.dept_code = 'PHYS'
ON CONFLICT (major_code) DO NOTHING;

INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'PHYS_P4', '양자물리', '양자물리의 이해', 4, true
FROM dept d
WHERE d.dept_code = 'PHYS'
ON CONFLICT (major_code) DO NOTHING;

INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'PHYS_P5', '물리수학', '물리수학의 이해', 5, true
FROM dept d
WHERE d.dept_code = 'PHYS'
ON CONFLICT (major_code) DO NOTHING;


-- ==========================================
-- 3. 학생 (Student) 생성 비밀번호 abc12345
-- ==========================================
-- 1-1. 학생 계정
INSERT INTO account (login_id, password_hash, account_type, status, created_at, updated_at)
VALUES 
    ('s20240002', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'STUDENT', 'ACTIVE', now(), now()),
    ('s20240003', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'STUDENT', 'ACTIVE', now(), now()),
    ('s20240004', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'STUDENT', 'ACTIVE', now(), now()),
    ('s20240005', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'STUDENT', 'ACTIVE', now(), now()),
    ('s20240006', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'STUDENT', 'ACTIVE', now(), now()),
    ('s20240007', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'STUDENT', 'ACTIVE', now(), now()),
    ('s20240008', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'STUDENT', 'ACTIVE', now(), now()),
    ('s20240009', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'STUDENT', 'ACTIVE', now(), now()),
    ('s20240010', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'STUDENT', 'ACTIVE', now(), now()),
    ('s20240011', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'STUDENT', 'ACTIVE', now(), now()),
    ('s20240012', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'STUDENT', 'ACTIVE', now(), now())
ON CONFLICT (login_id) DO NOTHING;

-- 1-2. 학생 프로필
INSERT INTO student_profile (account_id, student_no, name, email, phone, grade_level, academic_status, dept_id, created_at, updated_at)
SELECT a.account_id, '20240002', '박학생', 'student1@example.com', '010-7564-2222', 1, 'ENROLLED',(SELECT dept_id FROM dept WHERE dept_code = 'CS'), now(), now()
FROM account a WHERE a.login_id = 's20240002' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO student_profile (account_id, student_no, name, email, phone, grade_level, academic_status, dept_id, created_at, updated_at)
SELECT a.account_id, '20240003', '최학생', 'student2@example.com', '010-1111-2222', 2, 'ENROLLED', (SELECT dept_id FROM dept WHERE dept_code = 'CS'), now(), now()
FROM account a WHERE a.login_id = 's20240003' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO student_profile (account_id, student_no, name, email, phone, grade_level, academic_status, dept_id, created_at, updated_at)
SELECT a.account_id, '20240004', '이학생', 'student3@example.com', '010-2222-3333', 3, 'ENROLLED', (SELECT dept_id FROM dept WHERE dept_code = 'EE'), now(), now()
FROM account a WHERE a.login_id = 's20240004' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO student_profile (account_id, student_no, name, email, phone, grade_level, academic_status, dept_id, created_at, updated_at)
SELECT a.account_id, '20240005', '길학생', 'student4@example.com', '010-3333-4444', 4, 'ENROLLED', (SELECT dept_id FROM dept WHERE dept_code = 'BIZ'), now(), now()
FROM account a WHERE a.login_id = 's20240005' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO student_profile (account_id, student_no, name, email, phone, grade_level, academic_status, dept_id, created_at, updated_at)
SELECT a.account_id, '20240006', '정학생', 'student5@example.com', '010-4444-5555', 1, 'ENROLLED', (SELECT dept_id FROM dept WHERE dept_code = 'CS'), now(), now()
FROM account a WHERE a.login_id = 's20240006' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO student_profile (account_id, student_no, name, email, phone, grade_level, academic_status, dept_id, created_at, updated_at)
SELECT a.account_id, '20240007', '강학생', 'student6@example.com', '010-5555-6666', 2, 'ENROLLED', (SELECT dept_id FROM dept WHERE dept_code = 'EE'), now(), now()
FROM account a WHERE a.login_id = 's20240007' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO student_profile (account_id, student_no, name, email, phone, grade_level, academic_status, dept_id, created_at, updated_at)
SELECT a.account_id, '20240008', '유학생', 'student7@example.com', '010-6666-7777', 3, 'ENROLLED', (SELECT dept_id FROM dept WHERE dept_code = 'BIZ'), now(), now()
FROM account a WHERE a.login_id = 's20240008' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO student_profile (account_id, student_no, name, email, phone, grade_level, academic_status, dept_id, created_at, updated_at)
SELECT a.account_id, '20240009', '신학생', 'student8@example.com', '010-7777-8888', 4, 'ENROLLED', (SELECT dept_id FROM dept WHERE dept_code = 'CS'), now(), now()
FROM account a WHERE a.login_id = 's20240009' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO student_profile (account_id, student_no, name, email, phone, grade_level, academic_status, dept_id, created_at, updated_at)
SELECT a.account_id, '20240010', '호학생', 'student9@example.com', '010-8888-9999', 1, 'ENROLLED', (SELECT dept_id FROM dept WHERE dept_code = 'EE'), now(), now()
FROM account a WHERE a.login_id = 's20240010' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO student_profile (account_id, student_no, name, email, phone, grade_level, academic_status, dept_id, created_at, updated_at)
SELECT a.account_id, '20240011', '한학생', 'student10@example.com', '010-9999-0000', 2, 'ENROLLED', (SELECT dept_id FROM dept WHERE dept_code = 'BIZ'), now(), now()
FROM account a WHERE a.login_id = 's20240011' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO student_profile (account_id, student_no, name, email, phone, grade_level, academic_status, dept_id, created_at, updated_at)
SELECT a.account_id, '20240012', '조학생', 'student11@example.com', '010-1234-5678', 3, 'ENROLLED', (SELECT dept_id FROM dept WHERE dept_code = 'CS'), now(), now()
FROM account a WHERE a.login_id = 's20240012' ON CONFLICT (account_id) DO NOTHING;


-- ==========================================
-- 2. 교수 (Professor) 생성 비밀번호 abc12345
-- ==========================================
-- 2-1. 교수 계정
INSERT INTO account (login_id, password_hash, account_type, status, created_at, updated_at)
VALUES 
    ('p199900011', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'PROFESSOR', 'ACTIVE', now(), now()),
    ('p19990002', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'PROFESSOR', 'ACTIVE', now(), now()),
    ('p19990003', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'PROFESSOR', 'ACTIVE', now(), now()),
    ('p19990004', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'PROFESSOR', 'ACTIVE', now(), now()),
    ('p19990005', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'PROFESSOR', 'ACTIVE', now(), now()),
    ('p19990006', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'PROFESSOR', 'ACTIVE', now(), now()),
    ('p19990007', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'PROFESSOR', 'ACTIVE', now(), now()),
    ('p19990008', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'PROFESSOR', 'ACTIVE', now(), now()),
    ('p19990009', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'PROFESSOR', 'ACTIVE', now(), now()),
    ('p19990010', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'PROFESSOR', 'ACTIVE', now(), now()),
    ('p20250001', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'PROFESSOR', 'ACTIVE', now(), now()),
    ('p20250002', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'PROFESSOR', 'ACTIVE', now(), now()),
    ('p20250003', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'PROFESSOR', 'ACTIVE', now(), now()),
    ('p20250004', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'PROFESSOR', 'ACTIVE', now(), now())
ON CONFLICT (login_id) DO NOTHING;

-- 2-2. 교수 프로필
INSERT INTO professor_profile (account_id, professor_no, name, email, phone, dept_id, created_at, updated_at)
SELECT a.account_id, '199900011', '컴공1아교수', 'prof1@example.com', '010-3333-4444', (SELECT dept_id FROM dept WHERE dept_code = 'CS'), now(), now()
FROM account a WHERE a.login_id = 'p199900011' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO professor_profile (account_id, professor_no, name, email, phone, dept_id, created_at, updated_at)
SELECT a.account_id, '19990002', '컴공2이교수', 'prof2@example.com', '010-3333-1111', (SELECT dept_id FROM dept WHERE dept_code = 'CS'), now(), now()
FROM account a WHERE a.login_id = 'p19990002' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO professor_profile (account_id, professor_no, name, email, phone, dept_id, created_at, updated_at)
SELECT a.account_id, '19990003', '전자1다교수', 'prof3@example.com', '010-3333-2222', (SELECT dept_id FROM dept WHERE dept_code = 'EE'), now(), now()
FROM account a WHERE a.login_id = 'p19990003' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO professor_profile (account_id, professor_no, name, email, phone, dept_id, created_at, updated_at)
SELECT a.account_id, '19990004', '전자2수교수', 'prof4@example.com', '010-3333-3333', (SELECT dept_id FROM dept WHERE dept_code = 'EE'), now(), now()
FROM account a WHERE a.login_id = 'p19990004' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO professor_profile (account_id, professor_no, name, email, phone, dept_id, created_at, updated_at)
SELECT a.account_id, '19990005', '경영1목교수', 'prof5@example.com', '010-3333-5555', (SELECT dept_id FROM dept WHERE dept_code = 'BIZ'), now(), now()
FROM account a WHERE a.login_id = 'p19990005' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO professor_profile (account_id, professor_no, name, email, phone, dept_id, created_at, updated_at)
SELECT a.account_id, '19990006', '경영2금교수', 'prof6@example.com', '010-3333-6666', (SELECT dept_id FROM dept WHERE dept_code = 'BIZ'), now(), now()
FROM account a WHERE a.login_id = 'p19990006' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO professor_profile (account_id, professor_no, name, email, phone, dept_id, created_at, updated_at)
SELECT a.account_id, '19990007', '경영3토교수', 'prof7@example.com', '010-3333-7777', (SELECT dept_id FROM dept WHERE dept_code = 'BIZ'), now(), now()
FROM account a WHERE a.login_id = 'p19990007' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO professor_profile (account_id, professor_no, name, email, phone, dept_id, created_at, updated_at)
SELECT a.account_id, '19990008', '컴공3일교수', 'prof8@example.com', '010-3333-8888', (SELECT dept_id FROM dept WHERE dept_code = 'CS'), now(), now()
FROM account a WHERE a.login_id = 'p19990008' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO professor_profile (account_id, professor_no, name, email, phone, dept_id, created_at, updated_at)
SELECT a.account_id, '19990009', '전자3신교수', 'prof9@example.com', '010-3333-9999', (SELECT dept_id FROM dept WHERE dept_code = 'EE'), now(), now()
FROM account a WHERE a.login_id = 'p19990009' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO professor_profile (account_id, professor_no, name, email, phone, dept_id, created_at, updated_at)
SELECT a.account_id, '19990010', '경영4지교수', 'prof10@example.com', '010-3333-0000', (SELECT dept_id FROM dept WHERE dept_code = 'BIZ'), now(), now()
FROM account a WHERE a.login_id = 'p19990010' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO professor_profile (account_id, professor_no, name, email, phone, dept_id, created_at, updated_at)
SELECT a.account_id, '20250001', '수학1교수', 'math1@example.com', '010-0000-0001', (SELECT dept_id FROM dept WHERE dept_code = 'MATH'), now(), now()
FROM account a WHERE a.login_id = 'p20250001' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO professor_profile (account_id, professor_no, name, email, phone, dept_id, created_at, updated_at)
SELECT a.account_id, '20250002', '수학2교수', 'math2@example.com', '010-0000-0002', (SELECT dept_id FROM dept WHERE dept_code = 'MATH'), now(), now()
FROM account a WHERE a.login_id = 'p20250002' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO professor_profile (account_id, professor_no, name, email, phone, dept_id, created_at, updated_at)
SELECT a.account_id, '20250003', '물리1교수', 'phys1@example.com', '010-0000-0003', (SELECT dept_id FROM dept WHERE dept_code = 'PHYS'), now(), now()
FROM account a WHERE a.login_id = 'p20250003' ON CONFLICT (account_id) DO NOTHING;

INSERT INTO professor_profile (account_id, professor_no, name, email, phone, dept_id, created_at, updated_at)
SELECT a.account_id, '20250004', '물리2교수', 'phys2@example.com', '010-0000-0004', (SELECT dept_id FROM dept WHERE dept_code = 'PHYS'), now(), now()
FROM account a WHERE a.login_id = 'p20250004' ON CONFLICT (account_id) DO NOTHING;






-- ==========================================
-- 4. 학기 (semester) 
-- ==========================================
INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2015, 'FIRST', '2015-03-01', '2015-06-30', 'ACTIVE', '2015-1학기')
ON CONFLICT (year, term) DO NOTHING;
INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2015, 'SECOND', '2015-09-01', '2015-12-24', 'ACTIVE', '2015-2학기')
ON CONFLICT (year, term) DO NOTHING;

INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2016, 'FIRST', '2016-03-01', '2016-06-30', 'ACTIVE', '2016-1학기')
ON CONFLICT (year, term) DO NOTHING;
INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2016, 'SECOND', '2016-09-01', '2016-12-24', 'ACTIVE', '2016-2학기')
ON CONFLICT (year, term) DO NOTHING;

INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2017, 'FIRST', '2017-03-01', '2017-06-30', 'ACTIVE', '2017-1학기')
ON CONFLICT (year, term) DO NOTHING;
INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2017, 'SECOND', '2017-09-01', '2017-12-24', 'ACTIVE', '2017-2학기')
ON CONFLICT (year, term) DO NOTHING;

INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2018, 'FIRST', '2018-03-01', '2018-06-30', 'ACTIVE', '2018-1학기')
ON CONFLICT (year, term) DO NOTHING;
INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2018, 'SECOND', '2018-09-01', '2018-12-24', 'ACTIVE', '2018-2학기')
ON CONFLICT (year, term) DO NOTHING;

INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2019, 'FIRST', '2019-03-01', '2019-06-30', 'ACTIVE', '2019-1학기')
ON CONFLICT (year, term) DO NOTHING;
INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2019, 'SECOND', '2019-09-01', '2019-12-24', 'ACTIVE', '2019-2학기')
ON CONFLICT (year, term) DO NOTHING;

INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2020, 'FIRST', '2020-03-01', '2020-06-30', 'ACTIVE', '2020-1학기')
ON CONFLICT (year, term) DO NOTHING;
INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2020, 'SECOND', '2020-09-01', '2020-12-24', 'ACTIVE', '2020-2학기')
ON CONFLICT (year, term) DO NOTHING;

INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2021, 'FIRST', '2021-03-01', '2021-06-30', 'ACTIVE', '2021-1학기')
ON CONFLICT (year, term) DO NOTHING;
INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2021, 'SECOND', '2021-09-01', '2021-12-24', 'ACTIVE', '2021-2학기')
ON CONFLICT (year, term) DO NOTHING;

INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2022, 'FIRST', '2022-03-01', '2022-06-30', 'ACTIVE', '2022-1학기')
ON CONFLICT (year, term) DO NOTHING;
INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2022, 'SECOND', '2022-09-01', '2022-12-24', 'ACTIVE', '2022-2학기')
ON CONFLICT (year, term) DO NOTHING;

INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2023, 'FIRST', '2023-03-01', '2023-06-30', 'ACTIVE', '2023-1학기')
ON CONFLICT (year, term) DO NOTHING;
INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2023, 'SECOND', '2023-09-01', '2023-12-24', 'ACTIVE', '2023-2학기')
ON CONFLICT (year, term) DO NOTHING;

INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2024, 'FIRST', '2024-03-01', '2024-06-30', 'ACTIVE', '2024-1학기')
ON CONFLICT (year, term) DO NOTHING;
INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2024, 'SECOND', '2024-09-01', '2024-12-24', 'ACTIVE', '2024-2학기')
ON CONFLICT (year, term) DO NOTHING;

INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2025, 'FIRST', '2025-03-01', '2025-06-30', 'ACTIVE', '2025-1학기')
ON CONFLICT (year, term) DO NOTHING;
INSERT INTO semester (year, term, start_date, end_date, status, display_name)
VALUES (2025, 'SECOND', '2025-09-01', '2025-12-24', 'ACTIVE', '2025-2학기')
ON CONFLICT (year, term) DO NOTHING;




-- ==========================================
-- 5. 진단지 등록 (diagnostic) 
-- ==========================================

-- 5-1. 진단 실행 생성 (2024-1학기 기본 진단)
INSERT INTO diagnosis_run (semester_id, title, start_at, end_at, status, target_grade)
SELECT 
    s.semester_id, '2024학년도 1학기 핵심역량 진단', '2024-03-01 09:00:00', '2024-06-30 23:59:59', 'OPEN', 1
FROM semester s WHERE s.year = 2024 AND s.term = 'FIRST'
ON CONFLICT (semester_id) DO NOTHING;

-- 5-2. 진단 문항 등록 (C1~C6 대응, 총 20문항)
-- C1: Critical Thinking 
-- C2: Communication 
-- C3: Collaboration 
-- C4: Creativity 
-- C5: Character 
-- C6: Citizenship 

-- 1~6번 (핵심 문항)
INSERT INTO diagnosis_question (run_id, domain, question_type, content, sort_order, c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score)
SELECT r.run_id, 'SKILL', 'SCALE', '나는 당면한 문제의 핵심을 파악하고 논리적으로 분석할 수 있다.', 1, 6, 0, 0, 0, 0, 0
FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST' ON CONFLICT (run_id, sort_order) DO NOTHING;

INSERT INTO diagnosis_question (run_id, domain, question_type, content, sort_order, c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score)
SELECT r.run_id, 'SKILL', 'SCALE', '나는 자신의 의견을 타인에게 명확하고 설득력 있게 전달할 수 있다.', 2, 0, 5, 0, 0, 0, 0
FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST' ON CONFLICT (run_id, sort_order) DO NOTHING;

INSERT INTO diagnosis_question (run_id, domain, question_type, content, sort_order, c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score)
SELECT r.run_id, 'SKILL', 'SCALE', '나는 팀원들과 협력하여 공동의 목표를 달성하기 위해 노력한다.', 3, 0, 0, 5, 0, 0, 0
FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST' ON CONFLICT (run_id, sort_order) DO NOTHING;

INSERT INTO diagnosis_question (run_id, domain, question_type, content, sort_order, c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score)
SELECT r.run_id, 'SKILL', 'SCALE', '나는 고정관념에서 벗어나 새로운 시각으로 문제를 바라보고자 한다.', 4, 0, 0, 0, 5, 0, 0
FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST' ON CONFLICT (run_id, sort_order) DO NOTHING;

INSERT INTO diagnosis_question (run_id, domain, question_type, content, sort_order, c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score)
SELECT r.run_id, 'APTITUDE', 'SCALE', '나는 어려운 상황에서도 포기하지 않고 끝까지 책임을 다한다.', 5, 0, 0, 0, 0, 5, 0
FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST' ON CONFLICT (run_id, sort_order) DO NOTHING;

INSERT INTO diagnosis_question (run_id, domain, question_type, content, sort_order, c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score)
SELECT r.run_id, 'APTITUDE', 'SCALE', '나는 사회의 일원으로서 공동체의 발전을 위해 기꺼이 참여한다.', 6, 0, 0, 0, 0, 0, 5
FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST' ON CONFLICT (run_id, sort_order) DO NOTHING;

-- 7~20번 (추가 문항)
INSERT INTO diagnosis_question (run_id, domain, question_type, content, sort_order, c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score)
SELECT r.run_id, 'SKILL', 'SCALE', '나는 다양한 정보 중에서 신뢰할 수 있는 정보를 선별하고 비판적으로 수용한다.', 6, 5, 0, 0, 0, 0, 0
FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST' ON CONFLICT (run_id, sort_order) DO NOTHING;

INSERT INTO diagnosis_question (run_id, domain, question_type, content, sort_order, c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score)
SELECT r.run_id, 'SKILL', 'SCALE', '나는 타인의 의견을 경청하며 상호 존중하는 태도로 의사소통한다.', 6, 0, 5, 0, 0, 0, 0
FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST' ON CONFLICT (run_id, sort_order) DO NOTHING;

INSERT INTO diagnosis_question (run_id, domain, question_type, content, sort_order, c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score)
SELECT r.run_id, 'SKILL', 'SCALE', '나는 팀 내 갈등이 발생했을 때 합리적인 중재안을 제시하여 해결을 돕는다.', 6, 0, 0, 5, 0, 0, 0
FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST' ON CONFLICT (run_id, sort_order) DO NOTHING;

INSERT INTO diagnosis_question (run_id, domain, question_type, content, sort_order, c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score)
SELECT r.run_id, 'SKILL', 'SCALE', '나는 디지털 기술을 활용하여 기존의 업무 방식을 혁신적으로 개선할 수 있다.', 6, 0, 0, 0, 5, 0, 0
FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST' ON CONFLICT (run_id, sort_order) DO NOTHING;

INSERT INTO diagnosis_question (run_id, domain, question_type, content, sort_order, c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score)
SELECT r.run_id, 'SKILL', 'SCALE', '나는 복잡한 현상을 체계적인 절차에 따라 정리하고 의사결정을 내린다.', 6, 5, 0, 0, 0, 0, 0
FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST' ON CONFLICT (run_id, sort_order) DO NOTHING;

INSERT INTO diagnosis_question (run_id, domain, question_type, content, sort_order, c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score)
SELECT r.run_id, 'SKILL', 'SCALE', '나는 상황에 적절한 비언어적 표현을 사용하여 메시지의 전달력을 높인다.', 6, 0, 5, 0, 0, 0, 0
FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST' ON CONFLICT (run_id, sort_order) DO NOTHING;

INSERT INTO diagnosis_question (run_id, domain, question_type, content, sort_order, c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score)
SELECT r.run_id, 'SKILL', 'SCALE', '나는 동료들이 목표 달성에 몰입할 수 있도록 긍정적인 영향력을 발휘한다.', 6, 0, 0, 5, 0, 0, 0
FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST' ON CONFLICT (run_id, sort_order) DO NOTHING;

INSERT INTO diagnosis_question (run_id, domain, question_type, content, sort_order, c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score)
SELECT r.run_id, 'SKILL', 'SCALE', '나는 변화하는 환경에 유연하게 대응하며 새로운 아이디어를 끊임없이 제안한다.', 6, 0, 0, 0, 5, 0, 0
FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST' ON CONFLICT (run_id, sort_order) DO NOTHING;

INSERT INTO diagnosis_question (run_id, domain, question_type, content, sort_order, c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score)
SELECT r.run_id, 'APTITUDE', 'SCALE', '나는 공적인 업무를 수행함에 있어 윤리 규범과 원칙을 철저히 준수한다.', 6, 0, 0, 0, 0, 5, 0
FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST' ON CONFLICT (run_id, sort_order) DO NOTHING;

INSERT INTO diagnosis_question (run_id, domain, question_type, content, sort_order, c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score)
SELECT r.run_id, 'APTITUDE', 'SCALE', '나는 글로벌 사회의 이슈에 관심을 갖고 시민으로서 책임감 있게 행동한다.', 6, 0, 0, 0, 0, 0, 5
FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST' ON CONFLICT (run_id, sort_order) DO NOTHING;

INSERT INTO diagnosis_question (run_id, domain, question_type, content, sort_order, c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score)
SELECT r.run_id, 'SKILL', 'SCALE', '나는 문제 해결을 위해 다각적인 관점에서 대안을 검토하고 최적 안을 선택한다.', 6, 5, 0, 0, 0, 0, 0
FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST' ON CONFLICT (run_id, sort_order) DO NOTHING;

INSERT INTO diagnosis_question (run_id, domain, question_type, content, sort_order, c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score)
SELECT r.run_id, 'SKILL', 'SCALE', '나는 구체적인 수치나 근거를 활용하여 보고서나 문서를 논리적으로 작성한다.', 6, 0, 5, 0, 0, 0, 0
FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST' ON CONFLICT (run_id, sort_order) DO NOTHING;

INSERT INTO diagnosis_question (run_id, domain, question_type, content, sort_order, c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score)
SELECT r.run_id, 'SKILL', 'SCALE', '나는 타인의 피드백을 수용하여 자신의 부족한 점을 보완하고 성장의 기회로 삼는다.', 6, 0, 0, 5, 0, 0, 0
FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST' ON CONFLICT (run_id, sort_order) DO NOTHING;

INSERT INTO diagnosis_question (run_id, domain, question_type, content, sort_order, c1_max_score, c2_max_score, c3_max_score, c4_max_score, c5_max_score, c6_max_score)
SELECT r.run_id, 'SKILL', 'SCALE', '나는 아이디어를 시각화하거나 구체적인 프로토타입으로 구현하는 역량이 있다.', 6, 0, 0, 0, 5, 0, 0
FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST' ON CONFLICT (run_id, sort_order) DO NOTHING;

-- -- 5-3. 진단 대상자 등록 (모든 시드 학생 대상)
INSERT INTO diagnosis_target (run_id, student_account_id, status)
SELECT 
    r.run_id, a.account_id, 'PENDING'
FROM diagnosis_run r 
JOIN semester s ON r.semester_id = s.semester_id 
CROSS JOIN account a 
WHERE s.year = 2024 AND s.term = 'FIRST' 
  AND a.login_id LIKE 's2024%'
ON CONFLICT (run_id, student_account_id) DO NOTHING;

-- -- 5-4. 샘플 제출 기록 생성 (박학생, 최학생 제출 완료)
INSERT INTO diagnosis_submission (run_id, student_account_id, submitted_at)
SELECT 
    r.run_id, a.account_id, now()
FROM diagnosis_run r 
JOIN semester s ON r.semester_id = s.semester_id 
JOIN account a ON a.login_id IN ('s20240002', 's20240003')
WHERE s.year = 2024 AND s.term = 'FIRST'
ON CONFLICT (run_id, student_account_id) DO NOTHING;

-- 제출 상태 업데이트
UPDATE diagnosis_target SET status = 'SUBMITTED'
WHERE student_account_id IN (SELECT account_id FROM account WHERE login_id IN ('s20240002', 's20240003'))
AND run_id = (SELECT run_id FROM diagnosis_run r JOIN semester s ON r.semester_id = s.semester_id WHERE s.year = 2024 AND s.term = 'FIRST');

-- 5-5. 상세 답변 등록
-- 박학생 (s20240002) 답변 (고득점)
INSERT INTO diagnosis_answer (submission_id, question_id, scale_value)
SELECT 
    s.submission_id, q.question_id, 5
FROM diagnosis_submission s
JOIN account a ON s.student_account_id = a.account_id
JOIN diagnosis_question q ON s.run_id = q.run_id
WHERE a.login_id = 's20240002'
ON CONFLICT (submission_id, question_id) DO NOTHING;

-- 최학생 (s20240003) 답변 (중간점수)
INSERT INTO diagnosis_answer (submission_id, question_id, scale_value)
SELECT 
    s.submission_id, q.question_id, 3
FROM diagnosis_submission s
JOIN account a ON s.student_account_id = a.account_id
JOIN diagnosis_question q ON s.run_id = q.run_id
WHERE a.login_id = 's20240003'
ON CONFLICT (submission_id, question_id) DO NOTHING;


-- 1. 나머지 10명 학생(account_id 5~14 가정)에 대해 진단 제출 데이터 생성
-- 현재 account_id 4까지는 기존 데이터가 있거나 위에서 확인됨.
-- 안전하게 account_id를 조회하여 처리

-- DO $$ -- 임시로 실행하는 코드 블록 디비에 로컬에만 되고 전체 DB에는 적용 되지 않음
-- DECLARE
--     r_id BIGINT := 1; -- run_id for 2024-1 semester diagnosis
--     s_id BIGINT;
--     sub_id BIGINT;
--     q_id BIGINT;
-- BEGIN
--     -- 진단 미제출 학생 찾기 (전체 학생 중)
--     FOR s_id IN 
--         SELECT sp.account_id 
--         FROM student_profile sp
--         WHERE NOT EXISTS (
--             SELECT 1 FROM diagnosis_submission ds 
--             WHERE ds.student_account_id = sp.account_id AND ds.run_id = r_id
--         )
--     LOOP
--         -- 1. 제출 이력 생성
--         INSERT INTO diagnosis_submission (run_id, student_account_id, submitted_at)
--         VALUES (r_id, s_id, NOW())
--         RETURNING submission_id INTO sub_id;

--         -- 2. 답변 생성 (랜덤 점수 부여)
--         -- 모든 문항(run_id=1에 속한)에 대해
--         FOR q_id IN 
--             SELECT question_id FROM diagnosis_question WHERE run_id = r_id
--         LOOP
--             INSERT INTO diagnosis_answer (submission_id, question_id, scale_value)
--             VALUES (sub_id, q_id, floor(random() * 5 + 1)::int);
--         END LOOP;
        
--     END LOOP;
-- END $$;



-- ==========================================
-- 6. 교과 (Curricular)
-- ==========================================

-- 6-1. 교과목 마스터 (Curricular)
INSERT INTO curricular (curricular_code, curricular_name, dept_id, credits, description)
VALUES 
    -- CS
    ('CS101', '자료구조', (SELECT dept_id FROM dept WHERE dept_code = 'CS'), 3, '기본적인 데이터 구조 학습'),
    ('CS102', '알고리즘', (SELECT dept_id FROM dept WHERE dept_code = 'CS'), 3, '문제 해결을 위한 알고리즘 설계'),
    ('CS201', '데이터베이스', (SELECT dept_id FROM dept WHERE dept_code = 'CS'), 3, '데이터베이스 모델링 및 SQL'),
    -- EE
    ('EE101', '회로이론', (SELECT dept_id FROM dept WHERE dept_code = 'EE'), 3, '전기 회로의 기본 원리'),
    ('EE102', '디지털공학', (SELECT dept_id FROM dept WHERE dept_code = 'EE'), 3, '논리 회로 및 디지털 시스템 설계'),
    -- BIZ
    ('BIZ101', '마케팅원론', (SELECT dept_id FROM dept WHERE dept_code = 'BIZ'), 3, '현대 마케팅의 기초 개념'),
    ('BIZ102', '회계원리', (SELECT dept_id FROM dept WHERE dept_code = 'BIZ'), 3, '재무 회계의 기본 원칙'),
    -- MATH/PHYS
    ('MATH101', '미적분학', (SELECT dept_id FROM dept WHERE dept_code = 'MATH'), 3, '기초 미적분'),
    ('PHYS101', '일반물리', (SELECT dept_id FROM dept WHERE dept_code = 'PHYS'), 3, '물리학의 기초 개념')
ON CONFLICT (curricular_code) DO NOTHING;

-- 6-2. 운영 교과 (Curricular Offering) - 2023-SECOND (과거) 및 2024-FIRST (현재)
-- 2023-2학기 운영 교과
INSERT INTO curricular_offering (offering_code, curricular_id, semester_id, day_of_week, period, capacity, location, professor_account_id, status)
SELECT 
    c.curricular_code || '-2023-2', c.curricular_id, s.semester_id, 'TUESDAY', 2, 40, 'B관 202호', a.account_id, 'COMPLETED'
FROM curricular c
JOIN semester s ON s.year = 2023 AND s.term = 'SECOND'
JOIN account a ON a.login_id = CASE 
    WHEN c.curricular_code = 'CS101' THEN 'p199900011'
    WHEN c.curricular_code = 'EE101' THEN 'p19990003'
    WHEN c.curricular_code = 'BIZ101' THEN 'p19990005'
    WHEN c.curricular_code = 'MATH101' THEN 'p20250001'
    ELSE 'p199900011' -- Default
END
WHERE c.curricular_code IN ('CS101', 'EE101', 'BIZ101', 'MATH101')
ON CONFLICT (offering_code) DO NOTHING;

-- 2024-1학기 운영 교과
INSERT INTO curricular_offering (offering_code, curricular_id, semester_id, day_of_week, period, capacity, location, professor_account_id, status)
SELECT 
    c.curricular_code || '-2024-1', c.curricular_id, s.semester_id, 'MONDAY', 1, 40, 'A관 101호', a.account_id, 'OPEN'
FROM curricular c
JOIN semester s ON s.year = 2024 AND s.term = 'FIRST'
JOIN account a ON a.login_id = CASE 
    WHEN c.curricular_code = 'CS101' THEN 'p199900011'
    WHEN c.curricular_code = 'CS102' THEN 'p19990002'
    WHEN c.curricular_code = 'EE101' THEN 'p19990003'
    WHEN c.curricular_code = 'EE102' THEN 'p19990004'
    WHEN c.curricular_code = 'BIZ101' THEN 'p19990005'
    WHEN c.curricular_code = 'BIZ102' THEN 'p19990006'
    WHEN c.curricular_code = 'MATH101' THEN 'p20250001'
    WHEN c.curricular_code = 'PHYS101' THEN 'p20250003'
    ELSE 'p199900011'
END
ON CONFLICT (offering_code) DO NOTHING;

-- 6-3. 운영 교과별 역량 매핑
INSERT INTO curricular_offering_competency_map (offering_id, competency_id, weight)
SELECT 
    co.offering_id, comp.competency_id, 
    CASE comp.code 
        WHEN 'C1' THEN 6 WHEN 'C2' THEN 5 WHEN 'C3' THEN 4 WHEN 'C4' THEN 3 WHEN 'C5' THEN 2 WHEN 'C6' THEN 1 
    END
FROM curricular_offering co
CROSS JOIN competency comp
ON CONFLICT (offering_id, competency_id) DO NOTHING;

-- 6-4. 수강 신청 (Enrollment)
-- 과거 학기 (2023-2) 성적 데이터
INSERT INTO enrollment (offering_id, student_account_id, enrollment_status, completion_status, raw_score, grade, is_grade_confirmed)
SELECT 
    co.offering_id, a.account_id, 'ENROLLED', 'PASSED', 95, 'A+', true
FROM curricular_offering co
CROSS JOIN account a 
WHERE co.offering_code LIKE '%-2023-2' AND a.login_id IN ('s20240002', 's20240003')
ON CONFLICT (offering_id, student_account_id) DO NOTHING;

-- 현재 학기 (2024-1) 수강 데이터
INSERT INTO enrollment (offering_id, student_account_id, enrollment_status, completion_status)
SELECT 
    co.offering_id, a.account_id, 'ENROLLED', 'IN_PROGRESS'
FROM curricular_offering co
CROSS JOIN account a 
WHERE co.offering_code LIKE '%-2024-1' AND a.login_id IN ('s20240002', 's20240003')
ON CONFLICT (offering_id, student_account_id) DO NOTHING;

-- ==========================================
-- 1. 진단 관련 권한 추가
-- 2. 역할별 권한 매핑 (ADMIN, PROFESSOR, STUDENT)
-- 3. 계정-역할 매핑 복구 및 강화
-- ==========================================================

-- 1. 신규 권한 정의
INSERT INTO auth_permission (code, description, created_at, updated_at)
VALUES
  ('DIAGNOSIS_READ',   '진단지 및 결과 조회', now(), now()),
  ('DIAGNOSIS_MANAGE', '진단지 등록/수정/삭제/참여자 관리', now(), now())
ON CONFLICT (code) DO NOTHING;

-- 2. 역할-권한 매핑 (기존 역할 ID 조회 기반)

-- 2-1. ADMIN_SYSTEM: 진단 모든 권한
INSERT INTO auth_role_permission (role_id, permission_id, created_at, created_by)
SELECT r.role_id, p.permission_id, now(), 1
FROM auth_role r
JOIN auth_permission p ON p.code IN ('DIAGNOSIS_READ', 'DIAGNOSIS_MANAGE')
WHERE r.code = 'ADMIN_SYSTEM'
ON CONFLICT DO NOTHING;

-- 2-2. PROFESSOR_BASIC: 진단 조회 권한
INSERT INTO auth_role_permission (role_id, permission_id, created_at, created_by)
SELECT r.role_id, p.permission_id, now(), 1
FROM auth_role r
JOIN auth_permission p ON p.code IN ('DIAGNOSIS_READ')
WHERE r.code = 'PROFESSOR_BASIC'
ON CONFLICT DO NOTHING;

-- 2-3. STUDENT_BASIC: 진단 조회 권한
INSERT INTO auth_role_permission (role_id, permission_id, created_at, created_by)
SELECT r.role_id, p.permission_id, now(), 1
FROM auth_role r
JOIN auth_permission p ON p.code IN ('DIAGNOSIS_READ')
WHERE r.code = 'STUDENT_BASIC'
ON CONFLICT DO NOTHING;

-- 3. 계정-역할 매핑 (Account-Role Mapping) 누락 방지

-- 3-1. 모든 학생 계정 -> STUDENT_BASIC
INSERT INTO auth_account_role (account_id, role_id, assigned_at, assigned_by)
SELECT sp.account_id, r.role_id, now(), 1
FROM student_profile sp, auth_role r
WHERE r.code = 'STUDENT_BASIC'
ON CONFLICT DO NOTHING;

-- 3-2. 모든 교수 계정 -> PROFESSOR_BASIC
INSERT INTO auth_account_role (account_id, role_id, assigned_at, assigned_by)
SELECT pp.account_id, r.role_id, now(), 1
FROM professor_profile pp, auth_role r
WHERE r.code = 'PROFESSOR_BASIC'
ON CONFLICT DO NOTHING;

-- 3-3. 관리자 계정(a20001122) -> ADMIN_SYSTEM
INSERT INTO auth_account_role (account_id, role_id, assigned_at, assigned_by)
SELECT a.account_id, r.role_id, now(), 1
FROM account a, auth_role r
WHERE a.login_id = 'a20001122' AND r.code = 'ADMIN_SYSTEM'
ON CONFLICT DO NOTHING;

-- 3-4. 기타 admin 계정 -> ADMIN_SYSTEM (혹시 존재한다면)
INSERT INTO auth_account_role (account_id, role_id, assigned_at, assigned_by)
SELECT a.account_id, r.role_id, now(), 1
FROM account a, auth_role r
WHERE (a.login_id = 'admin') AND r.code = 'ADMIN_SYSTEM'
ON CONFLICT DO NOTHING;
