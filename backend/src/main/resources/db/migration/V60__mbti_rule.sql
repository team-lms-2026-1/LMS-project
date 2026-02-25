-- =========================================================================
-- 1. 권한
-- =========================================================================

-- 1. 신규 권한 정의
INSERT INTO auth_permission (code, description, created_at, updated_at)
VALUES
  ('MBTI_READ',   'MBTI 조회', now(), now()),
  ('MBTI_MANAGE', 'MBTI 관리', now(), now())
ON CONFLICT (code) DO NOTHING;

-- 2. 역할-권한 매핑 (기존 역할 ID 조회 기반)

-- 2-1. STUDENT_BASIC: 조회 권한
INSERT INTO auth_role_permission (role_id, permission_id, created_at, created_by)
SELECT r.role_id, p.permission_id, now(), 1
FROM auth_role r
JOIN auth_permission p ON p.code IN ('MBTI_READ', 'MBTI_MANAGE')
WHERE r.code = 'STUDENT_BASIC'
ON CONFLICT DO NOTHING;


-- 3. 계정-역할 매핑 (Account-Role Mapping) 누락 방지

-- 3-1. 모든 학생 계정 -> STUDENT_BASIC
INSERT INTO auth_account_role (account_id, role_id, assigned_at, assigned_by)
SELECT sp.account_id, r.role_id, now(), 1
FROM student_profile sp, auth_role r
WHERE r.code = 'STUDENT_BASIC'
ON CONFLICT DO NOTHING;
