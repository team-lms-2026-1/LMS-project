-- 1. Create permissions
INSERT INTO auth_permission (code, description)
VALUES 
    ('SURVEY_READ',    '설문 조회/참여'),
    ('SURVEY_MANAGE',  '설문 관리'),
    ('MENTORING_READ',   '멘토링 조회/참여'),
    ('MENTORING_MANAGE', '멘토링 관리')
ON CONFLICT (code) DO NOTHING;

-- 2. Grant ALL to ADMIN_SYSTEM
INSERT INTO auth_role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM auth_role r
CROSS JOIN auth_permission p
WHERE r.code = 'ADMIN_SYSTEM'
  AND p.code IN ('SURVEY_READ', 'SURVEY_MANAGE', 'MENTORING_READ', 'MENTORING_MANAGE')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 3. Grant READ to STUDENT_BASIC & PROFESSOR_BASIC
INSERT INTO auth_role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM auth_role r
CROSS JOIN auth_permission p
WHERE r.code IN ('STUDENT_BASIC', 'PROFESSOR_BASIC')
  AND p.code IN ('SURVEY_READ', 'MENTORING_READ')
ON CONFLICT (role_id, permission_id) DO NOTHING;
