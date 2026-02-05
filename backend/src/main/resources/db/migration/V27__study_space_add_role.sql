-- ================================================================
-- 2-1. 학생 예약 삭제 권한 추가
-- ================================================================
-- 1. 권한 정의
INSERT INTO auth_permission (code, description, created_at, updated_at)
VALUES ('RENTAL_DELETE', '예약 삭제', now(), now())
ON CONFLICT (code) DO NOTHING;

-- 2. 역할 - 권한 매핑
-- STUDENT_BASIC (학생), ADMIN_SYSTEM (관리자)에게 예약 삭제 권한 부여
INSERT INTO auth_role_permission (role_id, permission_id, created_at, created_by)
SELECT r.role_id, p.permission_id, now(), 1
FROM auth_role r
JOIN auth_permission p ON p.code = 'RENTAL_DELETE'
WHERE r.code IN ('STUDENT_BASIC', 'ADMIN_SYSTEM')
ON CONFLICT DO NOTHING;