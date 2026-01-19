-- 관리자 계정(a20001122)에 ADMIN_SYSTEM 역할 부여
INSERT INTO auth_account_role (account_id, role_id, assigned_at, assigned_by)
SELECT a.account_id, r.role_id, now(), NULL
FROM account a
JOIN auth_role r ON r.code = 'ADMIN_SYSTEM'
WHERE a.login_id = 'a20001122'
ON CONFLICT (account_id, role_id) DO NOTHING;
