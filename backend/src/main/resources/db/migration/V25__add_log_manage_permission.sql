-- 1. Create LOG_MANAGE permission
INSERT INTO auth_permission (code, description)
VALUES ('LOG_MANAGE', '로그 관리')
ON CONFLICT (code) DO NOTHING;

-- 2. Grant LOG_MANAGE to ADMIN_SYSTEM
INSERT INTO auth_role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM auth_role r
JOIN auth_permission p ON p.code = 'LOG_MANAGE'
WHERE r.code = 'ADMIN_SYSTEM'
ON CONFLICT (role_id, permission_id) DO NOTHING;
