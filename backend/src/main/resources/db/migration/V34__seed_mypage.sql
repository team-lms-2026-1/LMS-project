-- V34__seed_mypage.sql
-- 마이페이지 및 비교과 데이터 검증을 위한 시드 데이터 (V1~V30 반영)
-- 대상: 박학생 (s20240002) 및 김학생 (s20240001)
-- 학기: 2024학년도 1학기 (ACTIVE)

-- ==========================================
-- 1. 활성 학기 (Active Semester) 설정
-- ==========================================
-- 2024-1학기를 ACTIVE로 설정 (기존 데이터가 있다면 업데이트)
INSERT INTO semester (year, term, display_name, start_date, end_date, status, created_at, updated_at)
VALUES (2024, 'FIRST', '2024학년도 1학기', '2024-03-02', '2024-06-20', 'ACTIVE', now(), now())
ON CONFLICT (year, term) DO UPDATE 
SET status = 'ACTIVE', display_name = '2024학년도 1학기';


-- ==========================================
-- 2. 교과목 (Curricular) & 운영 (Offering)
-- ==========================================
-- 2-1. [수강중] 알고리즘 (CS3001)
INSERT INTO curricular (curricular_code, curricular_name, credits, dept_id, created_at, updated_at)
SELECT 'CS3001', '알고리즘', 3, dept_id, now(), now() FROM dept WHERE dept_code = 'CS'
ON CONFLICT (curricular_code) DO NOTHING;

INSERT INTO curricular_offering (curricular_id, semester_id, professor_account_id, offering_code, capacity, day_of_week, period, location, status, created_at, updated_at)
SELECT 
    c.curricular_id, s.semester_id, (SELECT account_id FROM account WHERE login_id = 'p19990001'),
    'CS3001-01', 50, 'MON', 3, '301호', 'OPEN', now(), now()
FROM curricular c, semester s WHERE c.curricular_code = 'CS3001' AND s.year = 2024 AND s.term = 'FIRST'
ON CONFLICT (offering_code) DO NOTHING;

-- 2-2. [이수완료] 데이터베이스 (CS3002)
INSERT INTO curricular (curricular_code, curricular_name, credits, dept_id, created_at, updated_at)
SELECT 'CS3002', '데이터베이스', 3, dept_id, now(), now() FROM dept WHERE dept_code = 'CS'
ON CONFLICT (curricular_code) DO NOTHING;

INSERT INTO curricular_offering (curricular_id, semester_id, professor_account_id, offering_code, capacity, day_of_week, period, location, status, created_at, updated_at)
SELECT 
    c.curricular_id, s.semester_id, (SELECT account_id FROM account WHERE login_id = 'p19990001'),
    'CS3002-01', 50, 'TUE', 4, '302호', 'COMPLETED', now(), now()
FROM curricular c, semester s WHERE c.curricular_code = 'CS3002' AND s.year = 2024 AND s.term = 'FIRST'
ON CONFLICT (offering_code) DO NOTHING;


-- ==========================================
-- 3. 수강 신청 (Enrollment)
-- ==========================================
-- 박학생 (s20240002)
INSERT INTO enrollment (student_account_id, offering_id, enrollment_status, completion_status, raw_score, created_at, updated_at)
SELECT (SELECT account_id FROM account WHERE login_id = 's20240002'), co.offering_id, 'ENROLLED', 'IN_PROGRESS', NULL, now(), now()
FROM curricular_offering co WHERE co.offering_code = 'CS3001-01'
ON CONFLICT (student_account_id, offering_id) DO NOTHING;

INSERT INTO enrollment (student_account_id, offering_id, enrollment_status, completion_status, raw_score, created_at, updated_at)
SELECT (SELECT account_id FROM account WHERE login_id = 's20240002'), co.offering_id, 'ENROLLED', 'PASSED', 92.5, now(), now()
FROM curricular_offering co WHERE co.offering_code = 'CS3002-01'
ON CONFLICT (student_account_id, offering_id) DO UPDATE SET completion_status = 'PASSED', raw_score = 92.5;

-- 김학생 (s20240001) - 기본 테스트 계정용 데이터 추가
INSERT INTO enrollment (student_account_id, offering_id, enrollment_status, completion_status, raw_score, created_at, updated_at)
SELECT (SELECT account_id FROM account WHERE login_id = 's20240001'), co.offering_id, 'ENROLLED', 'IN_PROGRESS', NULL, now(), now()
FROM curricular_offering co WHERE co.offering_code = 'CS3001-01'
ON CONFLICT (student_account_id, offering_id) DO NOTHING;


-- ==========================================
-- 4. 비교과 (Extra-Curricular) 데이터
-- ==========================================
-- 4-1. 비교과 프로그램 (Extra Curricular)
INSERT INTO extra_curricular (extra_curricular_code, extra_curricular_name, description, host_org_name, is_active, created_at, updated_at)
VALUES ('EC_DATA_2024', '2024 데이터 분석 캠프', '데이터 분석 심화 과정입니다.', 'SW중심대학사업단', true, now(), now())
ON CONFLICT (extra_curricular_code) DO NOTHING;

INSERT INTO extra_curricular (extra_curricular_code, extra_curricular_name, description, host_org_name, is_active, created_at, updated_at)
VALUES ('EC_AI_BASIC_2024', '2024 AI 기초 특강', '인공지능 입문.', 'SW중심대학사업단', true, now(), now())
ON CONFLICT (extra_curricular_code) DO NOTHING;


-- 4-2. 비교과 운영 (Extra Offering)
INSERT INTO extra_curricular_offering (extra_curricular_id, extra_offering_code, extra_offering_name, host_contact_name, reward_point_default, recognized_hours_default, semester_id, operation_start_at, operation_end_at, status, created_at, updated_at)
SELECT ec.extra_curricular_id, 'ECO_DATA_2024_01', '데이터 분석 캠프 1기', '이담당', 20, 10, s.semester_id, '2024-03-01', '2024-06-30', 'OPEN', now(), now()
FROM extra_curricular ec, semester s WHERE ec.extra_curricular_code = 'EC_DATA_2024' AND s.year = 2024 AND s.term = 'FIRST'
ON CONFLICT (extra_offering_code) DO NOTHING;

INSERT INTO extra_curricular_offering (extra_curricular_id, extra_offering_code, extra_offering_name, host_contact_name, reward_point_default, recognized_hours_default, semester_id, operation_start_at, operation_end_at, status, created_at, updated_at)
SELECT ec.extra_curricular_id, 'ECO_AI_BASIC_2024_01', 'AI 기초 1기', '김담당', 10, 5, s.semester_id, '2024-03-01', '2024-06-30', 'OPEN', now(), now()
FROM extra_curricular ec, semester s WHERE ec.extra_curricular_code = 'EC_AI_BASIC_2024' AND s.year = 2024 AND s.term = 'FIRST'
ON CONFLICT (extra_offering_code) DO NOTHING;


-- 4-3. 비교과 회차 (Session)
INSERT INTO extra_curricular_session (extra_offering_id, session_name, start_at, end_at, status, reward_point, recognized_hours, created_at, updated_at)
SELECT eco.extra_offering_id, '1일차: 파이썬 기초', '2024-03-15 09:00:00', '2024-03-15 18:00:00', 'CLOSED', 20, 8, now(), now()
FROM extra_curricular_offering eco WHERE eco.extra_offering_code = 'ECO_DATA_2024_01'
ON CONFLICT (extra_offering_id, session_name) DO NOTHING;

INSERT INTO extra_curricular_session (extra_offering_id, session_name, start_at, end_at, status, reward_point, recognized_hours, created_at, updated_at)
SELECT eco.extra_offering_id, 'AI 개념 이해', '2024-03-16 10:00:00', '2024-03-16 12:00:00', 'CLOSED', 10, 2, now(), now()
FROM extra_curricular_offering eco WHERE eco.extra_offering_code = 'ECO_AI_BASIC_2024_01'
ON CONFLICT (extra_offering_id, session_name) DO NOTHING;


-- 4-4. 비교과 신청 (Application)
-- 박학생 (s20240002) -> 데이터 분석 캠프
INSERT INTO extra_curricular_application (extra_offering_id, student_account_id, apply_status, completion_status, passed_at, applied_at, created_at, updated_at)
SELECT eco.extra_offering_id, (SELECT account_id FROM account WHERE login_id = 's20240002'), 'APPLIED', 'PASSED', now(), now(), now(), now()
FROM extra_curricular_offering eco WHERE eco.extra_offering_code = 'ECO_DATA_2024_01'
ON CONFLICT (extra_offering_id, student_account_id) DO UPDATE SET completion_status = 'PASSED', apply_status = 'APPLIED';

-- 김학생 (s20240001) -> AI 기초
INSERT INTO extra_curricular_application (extra_offering_id, student_account_id, apply_status, completion_status, passed_at, applied_at, created_at, updated_at)
SELECT eco.extra_offering_id, (SELECT account_id FROM account WHERE login_id = 's20240001'), 'APPLIED', 'PASSED', now(), now(), now(), now()
FROM extra_curricular_offering eco WHERE eco.extra_offering_code = 'ECO_AI_BASIC_2024_01'
ON CONFLICT (extra_offering_id, student_account_id) DO UPDATE SET completion_status = 'PASSED', apply_status = 'APPLIED';


-- 4-5. 비교과 회차 이수 (Session Completion)
-- 박학생 (s20240002) -> 데이터 분석 캠프 -> 20점, 8시간
INSERT INTO extra_curricular_session_completion (session_id, application_id, is_attended, attended_at, earned_point, earned_hours, watched_seconds, created_at, updated_at)
SELECT ecs.session_id, eca.application_id, true, now(), 20, 8, 28800, now(), now()
FROM extra_curricular_session ecs
JOIN extra_curricular_application eca ON eca.extra_offering_id = ecs.extra_offering_id
WHERE ecs.session_name = '1일차: 파이썬 기초'
  AND eca.student_account_id = (SELECT account_id FROM account WHERE login_id = 's20240002')
ON CONFLICT (session_id, application_id) DO UPDATE SET is_attended = true, earned_point = 20, earned_hours = 8;

-- 김학생 (s20240001) -> AI 기초 -> 10점, 2시간
INSERT INTO extra_curricular_session_completion (session_id, application_id, is_attended, attended_at, earned_point, earned_hours, watched_seconds, created_at, updated_at)
SELECT ecs.session_id, eca.application_id, true, now(), 10, 2, 3600, now(), now()
FROM extra_curricular_session ecs
JOIN extra_curricular_application eca ON eca.extra_offering_id = ecs.extra_offering_id
WHERE ecs.session_name = 'AI 개념 이해'
  AND eca.student_account_id = (SELECT account_id FROM account WHERE login_id = 's20240001')
ON CONFLICT (session_id, application_id) DO UPDATE SET is_attended = true, earned_point = 10, earned_hours = 2;