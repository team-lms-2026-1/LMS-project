-- Ensure NOTICE permissions exist and are active
INSERT INTO auth_permission (code, description, is_active, created_at, updated_at)
VALUES
  ('NOTICE_READ',   '공지사항 조회', true, now(), now()),
  ('NOTICE_MANAGE', '공지사항 관리', true, now(), now())
ON CONFLICT (code) DO NOTHING;

UPDATE auth_permission
SET is_active = true, updated_at = now()
WHERE code IN ('NOTICE_READ', 'NOTICE_MANAGE')
  AND (is_active IS DISTINCT FROM true);

-- Ensure base roles exist and are active
INSERT INTO auth_role (code, description, role_scope, is_active, created_at, updated_at)
VALUES
  ('STUDENT_BASIC',   '학생 기본 역할',   'STUDENT',  true, now(), now()),
  ('PROFESSOR_BASIC', '교수 기본 역할',   'PROFESSOR', true, now(), now()),
  ('ADMIN_SYSTEM',    '시스템 관리자',    'ADMIN',     true, now(), now())
ON CONFLICT (code) DO NOTHING;

UPDATE auth_role
SET is_active = true, updated_at = now()
WHERE code IN ('STUDENT_BASIC', 'PROFESSOR_BASIC', 'ADMIN_SYSTEM')
  AND (is_active IS DISTINCT FROM true);

-- Role-permission mapping
INSERT INTO auth_role_permission (role_id, permission_id, created_at)
SELECT r.role_id, p.permission_id, now()
FROM auth_role r
JOIN auth_permission p ON p.code = 'NOTICE_READ'
WHERE r.code IN ('STUDENT_BASIC', 'PROFESSOR_BASIC', 'ADMIN_SYSTEM')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO auth_role_permission (role_id, permission_id, created_at)
SELECT r.role_id, p.permission_id, now()
FROM auth_role r
JOIN auth_permission p ON p.code = 'NOTICE_MANAGE'
WHERE r.code = 'ADMIN_SYSTEM'
ON CONFLICT (role_id, permission_id) DO NOTHING;
