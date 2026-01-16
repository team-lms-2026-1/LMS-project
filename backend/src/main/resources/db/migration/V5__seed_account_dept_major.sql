-- =====================================================
-- V5__seed_account_dept_major.sql
-- Seed Data (Feature: Account + Dept/Major)
-- - Auth Permission / Role / Role-Permission (idempotent)
-- - (Optional) Dept/Major sample data
-- =====================================================

-- =====================================================
-- 0. Notes
-- =====================================================
-- - Permission/Role seed는 중복 삽입 방지를 위해 ON CONFLICT DO NOTHING 사용
-- - 이미 적용된 버전 파일은 수정하지 말 것. 변경은 V6, V7...로 처리
-- - 운영에서 테스트 데이터가 싫으면 "4. Dept/Major Sample Data" 섹션을 제거하거나 별도 파일로 분리 권장

-- =====================================================
-- 1. Auth Permission Seed (Account + Dept/Major)
-- =====================================================
-- ※ permission.code 는 @PreAuthorize("hasAuthority('CODE')") 에서 그대로 사용됨
-- ※ READ  : 조회 권한
-- ※ MANAGE: 등록/수정/삭제/상태변경 포함 운영 권한
-- =====================================================

INSERT INTO auth_permission (code, description)
VALUES
  ('ACCOUNT_READ',   '계정 조회'),
  ('ACCOUNT_MANAGE', '계정 관리'),

  ('DEPT_READ',      '학과 조회'),
  ('DEPT_MANAGE',    '학과 관리'),

  ('MAJOR_READ',     '전공 조회'),
  ('MAJOR_MANAGE',   '전공 관리')
ON CONFLICT (code) DO NOTHING;


-- =====================================================
-- 2. Auth Role Seed
-- =====================================================
-- role_scope : STUDENT | PROFESSOR | ADMIN
-- =====================================================

INSERT INTO auth_role (code, description, role_scope)
VALUES
  ('STUDENT_BASIC',   '학생 기본 역할',   'STUDENT'),
  ('PROFESSOR_BASIC', '교수 기본 역할',   'PROFESSOR'),
  ('ADMIN_SYSTEM',    '시스템 관리자',    'ADMIN')
ON CONFLICT (code) DO NOTHING;


-- =====================================================
-- 3. Role - Permission Mapping Seed
-- =====================================================
-- 기본 정책(현 단계):
--  - STUDENT_BASIC   : 학과/전공 조회만
--  - PROFESSOR_BASIC : 학과/전공 조회만
--  - ADMIN_SYSTEM    : 계정 + 학과 + 전공 전체 관리
--
-- 구현 팁:
--  - 계정 생성 시 DefaultRoleAssignerService가 STUDENT_BASIC/PROFESSOR_BASIC/ADMIN_SYSTEM 자동 부여
-- =====================================================

-- 3-1) STUDENT_BASIC -> DEPT_READ, MAJOR_READ
INSERT INTO auth_role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM auth_role r
JOIN auth_permission p ON p.code IN ('DEPT_READ', 'MAJOR_READ')
WHERE r.code = 'STUDENT_BASIC'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 3-2) PROFESSOR_BASIC -> DEPT_READ, MAJOR_READ
INSERT INTO auth_role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM auth_role r
JOIN auth_permission p ON p.code IN ('DEPT_READ', 'MAJOR_READ')
WHERE r.code = 'PROFESSOR_BASIC'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 3-3) ADMIN_SYSTEM -> ALL (Account + Dept + Major)
INSERT INTO auth_role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM auth_role r
JOIN auth_permission p ON p.code IN (
  'ACCOUNT_READ','ACCOUNT_MANAGE',
  'DEPT_READ','DEPT_MANAGE',
  'MAJOR_READ','MAJOR_MANAGE'
)
WHERE r.code = 'ADMIN_SYSTEM'
ON CONFLICT (role_id, permission_id) DO NOTHING;


-- =====================================================
-- 4. Dept/Major Sample Data (Optional)
-- =====================================================
-- 운영 반영이 부담되면:
--  - 이 섹션을 삭제하거나, 별도 dev seed 파일로 분리 권장
-- =====================================================

-- 4-1) Dept
INSERT INTO dept (dept_code, dept_name, description, is_active)
VALUES
  ('CS',  '컴퓨터공학과', '소프트웨어 및 컴퓨터 시스템 전공', true),
  ('EE',  '전자공학과',   '전자 및 반도체 전공', true),
  ('BIZ', '경영학과',     '경영 및 회계 전공', true)
ON CONFLICT (dept_code) DO NOTHING;

-- 4-2) Major
-- 컴퓨터공학과
INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'CS_SW', '소프트웨어공학', '소프트웨어 개발 및 설계', 1, true
FROM dept d
WHERE d.dept_code = 'CS'
ON CONFLICT (major_code) DO NOTHING;

INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'CS_AI', '인공지능', 'AI 및 머신러닝', 2, true
FROM dept d
WHERE d.dept_code = 'CS'
ON CONFLICT (major_code) DO NOTHING;

-- 전자공학과
INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'EE_SEMI', '반도체공학', '반도체 설계 및 공정', 1, true
FROM dept d
WHERE d.dept_code = 'EE'
ON CONFLICT (major_code) DO NOTHING;

-- 경영학과
INSERT INTO major (dept_id, major_code, major_name, description, sort_order, is_active)
SELECT d.dept_id, 'BIZ_MGT', '경영학', '경영 전략 및 조직관리', 1, true
FROM dept d
WHERE d.dept_code = 'BIZ'
ON CONFLICT (major_code) DO NOTHING;
