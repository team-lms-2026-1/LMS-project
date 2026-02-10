-- V32__mypage.sql
-- 1. 학생 프로필 이미지 URL 컬럼 추가
ALTER TABLE student_profile
ADD COLUMN profile_image_url VARCHAR(500);

-- 2. 마이페이지용 학생 요약 뷰 (View) 생성
--    - 기본 정보 (학번, 이름, 학과 등)
--    - 성적 요약 (총 이수 학점, 평점 평균)
--    - 비교과 요약 (총 이수 포인트, 총 이수 시간)
--    - 이번 학기 시간표 (JSON 형태)

CREATE OR REPLACE VIEW view_student_mypage_summary AS
SELECT
    sp.account_id,
    sp.student_no,
    sp.name AS student_name,
    d.dept_name,
    sp.grade_level,
    sp.academic_status,
    sp.profile_image_url,
    
    -- [교과] 총 이수 학점 (패스한 과목의 학점 합계)
    COALESCE((
        SELECT SUM(c.credits)
        FROM enrollment e
        JOIN curricular_offering co ON e.offering_id = co.offering_id
        JOIN curricular c ON co.curricular_id = c.curricular_id
        WHERE e.student_account_id = sp.account_id
          AND e.completion_status = 'PASSED'
    ), 0) AS total_credits,
    
    -- [교과] 평점 평균 (Raw Score 평균으로 대체)
    COALESCE((
        SELECT AVG(e.raw_score)::NUMERIC(5,2)
        FROM enrollment e
        WHERE e.student_account_id = sp.account_id
          AND e.raw_score IS NOT NULL
    ), 0.00) AS average_score,

    -- [비교과] 총 이수 포인트
    COALESCE((
        SELECT SUM(ecsc.earned_point)
        FROM extra_curricular_application eca
        JOIN extra_curricular_session_completion ecsc ON eca.application_id = ecsc.application_id
        WHERE eca.student_account_id = sp.account_id
    ), 0) AS total_extra_points,

    -- [비교과] 총 이수 시간
    COALESCE((
        SELECT SUM(ecsc.earned_hours)
        FROM extra_curricular_application eca
        JOIN extra_curricular_session_completion ecsc ON eca.application_id = ecsc.application_id
        WHERE eca.student_account_id = sp.account_id
    ), 0) AS total_extra_hours,
    
    -- [교과] 이번 학기(ACTIVE Semester) 시간표 JSON 집계
    COALESCE((
        SELECT jsonb_agg(
            jsonb_build_object(
                'offering_name', c.curricular_name,
                'course_code', c.curricular_code,
                'day_of_week', co.day_of_week,
                'period', co.period,
                'location', co.location,
                'professor_name', p.name
            ) ORDER BY co.day_of_week, co.period
        )
        FROM enrollment e
        JOIN curricular_offering co ON e.offering_id = co.offering_id
        JOIN curricular c ON co.curricular_id = c.curricular_id
        JOIN semester s ON co.semester_id = s.semester_id
        LEFT JOIN professor_profile p ON co.professor_account_id = p.account_id
        WHERE e.student_account_id = sp.account_id
          AND e.enrollment_status = 'ENROLLED'
          AND s.status = 'ACTIVE'
    ), '[]'::jsonb) AS current_timetable_json

FROM student_profile sp
LEFT JOIN dept d ON sp.dept_id = d.dept_id;
