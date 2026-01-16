-- =====================================================
-- V6__student_profile_add_dept_id.sql
-- student_profile: dept_id 추가 (NOT NULL) + FK + index
-- 전제: student_profile에 기존 데이터가 없음
-- =====================================================

-- 1) 컬럼 추가 (바로 NOT NULL)
ALTER TABLE student_profile
  ADD COLUMN dept_id BIGINT NOT NULL;

-- 2) FK 추가 (dept는 V4에서 생성됨)
ALTER TABLE student_profile
  ADD CONSTRAINT fk_student_profile_dept
  FOREIGN KEY (dept_id) REFERENCES dept(dept_id);

-- 3) 인덱스
CREATE INDEX idx_student_profile_dept_id
  ON student_profile (dept_id);
