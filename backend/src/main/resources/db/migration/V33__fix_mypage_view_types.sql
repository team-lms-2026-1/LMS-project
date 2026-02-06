-- V33__fix_mypage_view_types.sql
-- Fixes type mismatch issues in view_student_mypage_summary.
-- PostgreSQL SUM(BIGINT) returns NUMERIC, causing SchemaManagementException with Java Long.
-- This migration explicitly casts the sums to BIGINT.

DROP VIEW IF EXISTS view_student_mypage_summary;

CREATE OR REPLACE VIEW view_student_mypage_summary AS
SELECT
    sp.account_id,
    sp.student_no,
    sp.name AS student_name,
    d.dept_name,
    sp.grade_level,
    sp.academic_status,
    sp.profile_image_url,
    
    -- [교과] 총 이수 학점 (SUM(INT) -> BIGINT)
    COALESCE((
        SELECT SUM(c.credits)
        FROM enrollment e
        JOIN curricular_offering co ON e.offering_id = co.offering_id
        JOIN curricular c ON co.curricular_id = c.curricular_id
        WHERE e.student_account_id = sp.account_id
          AND e.completion_status = 'PASSED'
    ), 0)::BIGINT AS total_credits,
    
    -- [교과] 평점 평균
    COALESCE((
        SELECT AVG(e.raw_score)::NUMERIC(5,2)
        FROM enrollment e
        WHERE e.student_account_id = sp.account_id
          AND e.raw_score IS NOT NULL
    ), 0.00) AS average_score,

    -- [비교과] 총 이수 포인트 (SUM(BIGINT) -> NUMERIC -> BIGINT)
    COALESCE((
        SELECT SUM(ecsc.earned_point)
        FROM extra_curricular_application eca
        JOIN extra_curricular_session_completion ecsc ON eca.application_id = ecsc.application_id
        WHERE eca.student_account_id = sp.account_id
    ), 0)::BIGINT AS total_extra_points,

    -- [비교과] 총 이수 시간 (SUM(BIGINT) -> NUMERIC -> BIGINT)
    COALESCE((
        SELECT SUM(ecsc.earned_hours)
        FROM extra_curricular_application eca
        JOIN extra_curricular_session_completion ecsc ON eca.application_id = ecsc.application_id
        WHERE eca.student_account_id = sp.account_id
    ), 0)::BIGINT AS total_extra_hours,
    
    -- [교과] 이번 학기 시간표 JSON
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
