-- =====================================================
-- V4__dept_major_student_major.sql
-- Department / Major / Student Major
-- =====================================================

-- =====================================================
-- 1. Dept (학과)
-- =====================================================
CREATE TABLE dept (
  dept_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  dept_code VARCHAR(30) NOT NULL UNIQUE,
  dept_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,

  head_professor_account_id BIGINT NULL,

  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT,

  CONSTRAINT fk_dept_head_professor_account
    FOREIGN KEY (head_professor_account_id) REFERENCES account(account_id),

  CONSTRAINT fk_dept_created_by
    FOREIGN KEY (created_by) REFERENCES account(account_id),

  CONSTRAINT fk_dept_updated_by
    FOREIGN KEY (updated_by) REFERENCES account(account_id)
);

CREATE INDEX idx_dept_is_active ON dept(is_active);

-- =====================================================
-- 2. Major (전공)
-- =====================================================
CREATE TABLE major (
  major_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  dept_id BIGINT NOT NULL,

  major_code VARCHAR(30) NOT NULL UNIQUE,
  major_name VARCHAR(100) NOT NULL,

  description TEXT NOT NULL,

  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT,

  CONSTRAINT fk_major_dept
    FOREIGN KEY (dept_id) REFERENCES dept(dept_id),

  CONSTRAINT fk_major_created_by
    FOREIGN KEY (created_by) REFERENCES account(account_id),

  CONSTRAINT fk_major_updated_by
    FOREIGN KEY (updated_by) REFERENCES account(account_id),

  CONSTRAINT uq_major_dept_name UNIQUE (dept_id, major_name)
);

CREATE INDEX idx_major_dept_sort_order ON major(dept_id, sort_order);
CREATE INDEX idx_major_is_active ON major(is_active);

-- =====================================================
-- 3. Student Major (학생-전공 매핑)
-- =====================================================
CREATE TABLE student_major (
  student_account_id BIGINT NOT NULL,
  major_id BIGINT NOT NULL,

  major_type VARCHAR(20) NOT NULL, -- PRIMARY | DOUBLE | MINOR

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT,

  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT,

  CONSTRAINT pk_student_major PRIMARY KEY (student_account_id, major_id),

  CONSTRAINT fk_student_major_student
    FOREIGN KEY (student_account_id) REFERENCES account(account_id),

  CONSTRAINT fk_student_major_major
    FOREIGN KEY (major_id) REFERENCES major(major_id),

  CONSTRAINT fk_student_major_created_by
    FOREIGN KEY (created_by) REFERENCES account(account_id),

  CONSTRAINT fk_student_major_updated_by
    FOREIGN KEY (updated_by) REFERENCES account(account_id),

  CONSTRAINT ck_student_major_type
    CHECK (major_type IN ('PRIMARY', 'DOUBLE', 'MINOR'))
);

CREATE INDEX idx_student_major_major_id ON student_major(major_id);

-- 학생당 PRIMARY 전공은 1개만 허용 (PostgreSQL 부분 UNIQUE 인덱스)
CREATE UNIQUE INDEX ux_student_major_primary_one
  ON student_major(student_account_id)
  WHERE major_type = 'PRIMARY';

-- =====================================================
-- 4. professor_profile.dept_id FK 연결
--    (V2에서 professor_profile 먼저 생성되어 있으니 ALTER로 FK만 추가)
-- =====================================================
ALTER TABLE professor_profile
  ADD CONSTRAINT fk_professor_profile_dept
  FOREIGN KEY (dept_id) REFERENCES dept(dept_id);

-- 운영 데이터가 세팅된 뒤 아래를 별도 마이그레이션(V5 등)로 적용 권장.
-- ALTER TABLE dept ALTER COLUMN head_professor_account_id SET NOT NULL;
