-- =====================================================
-- V11__extra_application_apply_and_completion_status.sql
-- extra_curricular_application: apply_status / completion_status / passed_at
-- =====================================================

ALTER TABLE extra_curricular_application
  ADD COLUMN apply_status VARCHAR(20) NOT NULL DEFAULT 'APPLIED',
  ADD COLUMN completion_status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
  ADD COLUMN passed_at TIMESTAMP NULL;

-- =========================
-- CHECK constraints
-- =========================
ALTER TABLE extra_curricular_application
  ADD CONSTRAINT ck_extra_application_apply_status
  CHECK (apply_status IN ('APPLIED', 'CANCELED'));

ALTER TABLE extra_curricular_application
  ADD CONSTRAINT ck_extra_application_completion_status
  CHECK (completion_status IN ('IN_PROGRESS', 'PASSED', 'FAILED'));

-- =========================
-- Indexes (조회 최적화)
-- =========================
-- 운영별 신청자 목록 + 상태 필터용
CREATE INDEX idx_extra_app_offering_apply_status
  ON extra_curricular_application (extra_offering_id, apply_status);

CREATE INDEX idx_extra_app_offering_completion_status
  ON extra_curricular_application (extra_offering_id, completion_status);

-- 학생별 신청/이수 상태 조회용
CREATE INDEX idx_extra_app_student_apply_status
  ON extra_curricular_application (student_account_id, apply_status);

CREATE INDEX idx_extra_app_student_completion_status
  ON extra_curricular_application (student_account_id, completion_status);
