-- Backfill default roles based on account_type
-- Ensures existing accounts always have their baseline role

-- STUDENT -> STUDENT_BASIC
INSERT INTO auth_account_role (account_id, role_id, assigned_at, assigned_by)
SELECT a.account_id, r.role_id, now(), NULL
FROM account a
JOIN auth_role r ON r.code = 'STUDENT_BASIC'
WHERE a.account_type = 'STUDENT'
ON CONFLICT (account_id, role_id) DO NOTHING;

-- PROFESSOR -> PROFESSOR_BASIC
INSERT INTO auth_account_role (account_id, role_id, assigned_at, assigned_by)
SELECT a.account_id, r.role_id, now(), NULL
FROM account a
JOIN auth_role r ON r.code = 'PROFESSOR_BASIC'
WHERE a.account_type = 'PROFESSOR'
ON CONFLICT (account_id, role_id) DO NOTHING;

-- ADMIN -> ADMIN_SYSTEM
INSERT INTO auth_account_role (account_id, role_id, assigned_at, assigned_by)
SELECT a.account_id, r.role_id, now(), NULL
FROM account a
JOIN auth_role r ON r.code = 'ADMIN_SYSTEM'
WHERE a.account_type = 'ADMIN'
ON CONFLICT (account_id, role_id) DO NOTHING;
