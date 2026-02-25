-- =========================================================================
-- 1. 권한
-- =========================================================================

-- 1. 신규 권한 정의
INSERT INTO auth_permission (code, description, created_at, updated_at)
VALUES
  ('CURRICULAR_READ',   '교과과정 조회', now(), now()),
  ('CURRICULAR_MANAGE', '교과과정 관리', now(), now()),
  ('CURRICULAR_CLASS', '수강관리', now(), now())
ON CONFLICT (code) DO NOTHING;

-- 2. 역할-권한 매핑 (기존 역할 ID 조회 기반)

-- 2-1. ADMIN_SYSTEM: 모든 권한
INSERT INTO auth_role_permission (role_id, permission_id, created_at, created_by)
SELECT r.role_id, p.permission_id, now(), 1
FROM auth_role r
JOIN auth_permission p ON p.code IN ('CURRICULAR_READ', 'CURRICULAR_MANAGE', 'CURRICULAR_CLASS')
WHERE r.code = 'ADMIN_SYSTEM'
ON CONFLICT DO NOTHING;

-- 2-2. STUDENT_BASIC: 조회 권한
INSERT INTO auth_role_permission (role_id, permission_id, created_at, created_by)
SELECT r.role_id, p.permission_id, now(), 1
FROM auth_role r
JOIN auth_permission p ON p.code IN ('CURRICULAR_READ', 'CURRICULAR_CLASS')
WHERE r.code = 'STUDENT_BASIC'
ON CONFLICT DO NOTHING;

-- 2-3. PROFESSOR_BASIC: 조회 권한
INSERT INTO auth_role_permission (role_id, permission_id, created_at, created_by)
SELECT r.role_id, p.permission_id, now(), 1
FROM auth_role r
JOIN auth_permission p ON p.code IN ('CURRICULAR_READ')
WHERE r.code = 'PROFESSOR_BASIC'
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
SELECT sp.account_id, r.role_id, now(), 1
FROM professor_profile sp, auth_role r
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