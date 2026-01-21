-- =====================================================
-- V10__semester_curricular_extra_curricular.sql
-- Semester / Curricular / Offering / Enrollment
-- Extra-curricular / Offering / Session / Video / Application / Completion
-- =====================================================

-- =====================================================
-- 1) Semester
-- =====================================================
CREATE TABLE semester (
  semester_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  year INT NOT NULL,
  term VARCHAR(10) NOT NULL, -- '1' | '2'

  start_date DATE,
  end_date DATE,

  status VARCHAR(20) NOT NULL, -- PLANNED | ACTIVE | CLOSED

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT,

  CONSTRAINT uq_semester_year_term UNIQUE (year, term),

  CONSTRAINT ck_semester_term
    CHECK (term IN ('1', '2')),

  CONSTRAINT ck_semester_status
    CHECK (status IN ('PLANNED', 'ACTIVE', 'CLOSED')),

  CONSTRAINT ck_semester_date_range
    CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date),

  CONSTRAINT fk_semester_created_by
    FOREIGN KEY (created_by) REFERENCES account(account_id),

  CONSTRAINT fk_semester_updated_by
    FOREIGN KEY (updated_by) REFERENCES account(account_id)
);

-- =====================================================
-- 2) Curricular
-- =====================================================
CREATE TABLE curricular (
  curricular_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  curricular_code VARCHAR(50) NOT NULL UNIQUE,
  curricular_name VARCHAR(200) NOT NULL,

  dept_id BIGINT NOT NULL,

  credits INT NOT NULL DEFAULT 0,
  description TEXT,

  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT,

  CONSTRAINT fk_curricular_dept
    FOREIGN KEY (dept_id) REFERENCES dept(dept_id),

  CONSTRAINT fk_curricular_created_by
    FOREIGN KEY (created_by) REFERENCES account(account_id),

  CONSTRAINT fk_curricular_updated_by
    FOREIGN KEY (updated_by) REFERENCES account(account_id),

  CONSTRAINT ck_curricular_credits_non_negative
    CHECK (credits >= 0)
);

CREATE INDEX idx_curricular_dept_id ON curricular(dept_id);
CREATE INDEX idx_curricular_is_active ON curricular(is_active);

-- =====================================================
-- 3) Curricular Offering
-- (한 교과는 한 학기에 1개만 허용: UNIQUE(curricular_id, semester_id) 유지)
-- =====================================================
CREATE TABLE curricular_offering (
  offering_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  offering_code VARCHAR(50) NOT NULL UNIQUE,

  curricular_id BIGINT NOT NULL,
  semester_id BIGINT NOT NULL,

  day_of_week VARCHAR(20) NOT NULL, -- e.g. MONDAY
  period INT NOT NULL,              -- 1~6

  capacity INT NOT NULL,
  location VARCHAR(255) NOT NULL,

  professor_account_id BIGINT NOT NULL, -- exactly 1 professor

  status VARCHAR(30) NOT NULL, -- DRAFT | OPEN | ENROLLMENT_CLOSED | IN_PROGRESS | COMPLETED | CANCELED

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT,

  CONSTRAINT uq_curricular_offering_one_per_semester
    UNIQUE (curricular_id, semester_id),

  CONSTRAINT fk_curricular_offering_curricular
    FOREIGN KEY (curricular_id) REFERENCES curricular(curricular_id),

  CONSTRAINT fk_curricular_offering_semester
    FOREIGN KEY (semester_id) REFERENCES semester(semester_id),

  CONSTRAINT fk_curricular_offering_professor
    FOREIGN KEY (professor_account_id) REFERENCES account(account_id),

  CONSTRAINT fk_curricular_offering_created_by
    FOREIGN KEY (created_by) REFERENCES account(account_id),

  CONSTRAINT fk_curricular_offering_updated_by
    FOREIGN KEY (updated_by) REFERENCES account(account_id),

  CONSTRAINT ck_curricular_offering_period
    CHECK (period BETWEEN 1 AND 6),

  CONSTRAINT ck_curricular_offering_capacity_non_negative
    CHECK (capacity >= 0),

  CONSTRAINT ck_curricular_offering_status
    CHECK (status IN ('DRAFT','OPEN','ENROLLMENT_CLOSED','IN_PROGRESS','COMPLETED','CANCELED'))
);

CREATE INDEX idx_curricular_offering_curricular_id ON curricular_offering(curricular_id);
CREATE INDEX idx_curricular_offering_semester_id ON curricular_offering(semester_id);
CREATE INDEX idx_curricular_offering_professor_account_id ON curricular_offering(professor_account_id);

-- =====================================================
-- 4) Enrollment
-- =====================================================
CREATE TABLE enrollment (
  enrollment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  offering_id BIGINT NOT NULL,
  student_account_id BIGINT NOT NULL,

  enrollment_status VARCHAR(20) NOT NULL, -- ENROLLED | DROPPED | COMPLETED

  completion_status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS', -- IN_PROGRESS | PASSED | FAILED
  completed_at TIMESTAMP,

  raw_score INT,
  grade VARCHAR(10),

  is_grade_confirmed BOOLEAN NOT NULL DEFAULT false,
  grade_confirmed_at TIMESTAMP,
  grade_confirmed_by BIGINT,

  applied_at TIMESTAMP NOT NULL DEFAULT now(),

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT,

  CONSTRAINT uq_enrollment_offering_student UNIQUE (offering_id, student_account_id),

  CONSTRAINT fk_enrollment_offering
    FOREIGN KEY (offering_id) REFERENCES curricular_offering(offering_id),

  CONSTRAINT fk_enrollment_student
    FOREIGN KEY (student_account_id) REFERENCES account(account_id),

  CONSTRAINT fk_enrollment_grade_confirmed_by
    FOREIGN KEY (grade_confirmed_by) REFERENCES account(account_id),

  CONSTRAINT fk_enrollment_created_by
    FOREIGN KEY (created_by) REFERENCES account(account_id),

  CONSTRAINT fk_enrollment_updated_by
    FOREIGN KEY (updated_by) REFERENCES account(account_id),

  CONSTRAINT ck_enrollment_status
    CHECK (enrollment_status IN ('ENROLLED','DROPPED','COMPLETED')),

  CONSTRAINT ck_completion_status
    CHECK (completion_status IN ('IN_PROGRESS','PASSED','FAILED')),

  CONSTRAINT ck_raw_score_range
    CHECK (raw_score IS NULL OR (raw_score BETWEEN 0 AND 100))
);

CREATE INDEX idx_enrollment_offering_id ON enrollment(offering_id);
CREATE INDEX idx_enrollment_student_account_id ON enrollment(student_account_id);

-- =====================================================
-- 5) Extra-curricular
-- =====================================================
CREATE TABLE extra_curricular (
  extra_curricular_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  extra_curricular_code VARCHAR(50) UNIQUE,
  extra_curricular_name VARCHAR(200) NOT NULL,
  description TEXT,

  host_org_name VARCHAR(200),
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT,

  CONSTRAINT fk_extra_curricular_created_by
    FOREIGN KEY (created_by) REFERENCES account(account_id),

  CONSTRAINT fk_extra_curricular_updated_by
    FOREIGN KEY (updated_by) REFERENCES account(account_id)
);

CREATE INDEX idx_extra_curricular_is_active ON extra_curricular(is_active);

CREATE TABLE extra_curricular_offering (
  extra_offering_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  extra_curricular_id BIGINT NOT NULL,

  extra_offering_code VARCHAR(50) NOT NULL UNIQUE,
  extra_offering_name VARCHAR(200) NOT NULL,

  host_contact_name VARCHAR(100),
  host_contact_phone VARCHAR(50),
  host_contact_email VARCHAR(150),

  reward_point_default BIGINT NOT NULL DEFAULT 0,
  recognized_hours_default BIGINT NOT NULL DEFAULT 0,

  semester_id BIGINT,

  operation_start_at TIMESTAMP NOT NULL,
  operation_end_at TIMESTAMP NOT NULL,

  status VARCHAR(30) NOT NULL, -- DRAFT | OPEN | ENROLLMENT_CLOSED | IN_PROGRESS | COMPLETED | CANCELED

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT,

  CONSTRAINT fk_extra_offering_extra_curricular
    FOREIGN KEY (extra_curricular_id) REFERENCES extra_curricular(extra_curricular_id),

  CONSTRAINT fk_extra_offering_semester
    FOREIGN KEY (semester_id) REFERENCES semester(semester_id),

  CONSTRAINT fk_extra_offering_created_by
    FOREIGN KEY (created_by) REFERENCES account(account_id),

  CONSTRAINT fk_extra_offering_updated_by
    FOREIGN KEY (updated_by) REFERENCES account(account_id),

  CONSTRAINT ck_extra_offering_status
    CHECK (status IN ('DRAFT','OPEN','ENROLLMENT_CLOSED','IN_PROGRESS','COMPLETED','CANCELED')),

  CONSTRAINT ck_extra_offering_operation_range
    CHECK (operation_start_at <= operation_end_at)
);

CREATE INDEX idx_extra_offering_extra_curricular_id ON extra_curricular_offering(extra_curricular_id);
CREATE INDEX idx_extra_offering_semester_id ON extra_curricular_offering(semester_id);

CREATE TABLE extra_curricular_session (
  session_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  extra_offering_id BIGINT NOT NULL,

  session_name VARCHAR(100) NOT NULL, -- e.g. 1회차
  start_at TIMESTAMP NOT NULL,
  end_at TIMESTAMP NOT NULL,

  status VARCHAR(20) NOT NULL, -- OPEN | CLOSED | CANCELED

  reward_point BIGINT NOT NULL,
  recognized_hours BIGINT NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT,

  CONSTRAINT uq_extra_session_offering_name UNIQUE (extra_offering_id, session_name),

  CONSTRAINT fk_extra_session_offering
    FOREIGN KEY (extra_offering_id) REFERENCES extra_curricular_offering(extra_offering_id),

  CONSTRAINT fk_extra_session_created_by
    FOREIGN KEY (created_by) REFERENCES account(account_id),

  CONSTRAINT fk_extra_session_updated_by
    FOREIGN KEY (updated_by) REFERENCES account(account_id),

  CONSTRAINT ck_extra_session_status
    CHECK (status IN ('OPEN','CLOSED','CANCELED')),

  CONSTRAINT ck_extra_session_time_range
    CHECK (start_at <= end_at)
);

CREATE INDEX idx_extra_session_offering_id ON extra_curricular_session(extra_offering_id);
CREATE INDEX idx_extra_session_offering_start_at ON extra_curricular_session(extra_offering_id, start_at);

CREATE TABLE extra_curricular_session_video (
  video_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  session_id BIGINT NOT NULL UNIQUE,

  title VARCHAR(200) NOT NULL,
  video_url VARCHAR(1000),
  storage_key VARCHAR(500) UNIQUE,

  duration_seconds INT,

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT,

  CONSTRAINT fk_extra_video_session
    FOREIGN KEY (session_id) REFERENCES extra_curricular_session(session_id),

  CONSTRAINT fk_extra_video_created_by
    FOREIGN KEY (created_by) REFERENCES account(account_id),

  CONSTRAINT fk_extra_video_updated_by
    FOREIGN KEY (updated_by) REFERENCES account(account_id),

  -- exactly one of video_url, storage_key
  CONSTRAINT ck_extra_video_source_xor
    CHECK ((video_url IS NULL) <> (storage_key IS NULL))
);

CREATE TABLE extra_curricular_application (
  application_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  extra_offering_id BIGINT NOT NULL,
  student_account_id BIGINT NOT NULL,

  applied_at TIMESTAMP NOT NULL DEFAULT now(),

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT,

  CONSTRAINT uq_extra_application UNIQUE (extra_offering_id, student_account_id),

  CONSTRAINT fk_extra_application_offering
    FOREIGN KEY (extra_offering_id) REFERENCES extra_curricular_offering(extra_offering_id),

  CONSTRAINT fk_extra_application_student
    FOREIGN KEY (student_account_id) REFERENCES account(account_id),

  CONSTRAINT fk_extra_application_created_by
    FOREIGN KEY (created_by) REFERENCES account(account_id),

  CONSTRAINT fk_extra_application_updated_by
    FOREIGN KEY (updated_by) REFERENCES account(account_id)
);

CREATE INDEX idx_extra_application_offering_id ON extra_curricular_application(extra_offering_id);
CREATE INDEX idx_extra_application_student_applied_at ON extra_curricular_application(student_account_id, applied_at);

CREATE TABLE extra_curricular_session_completion (
  completion_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  session_id BIGINT NOT NULL,
  application_id BIGINT NOT NULL,

  is_attended BOOLEAN NOT NULL DEFAULT false,
  attended_at TIMESTAMP,

  earned_point BIGINT NOT NULL DEFAULT 0,
  earned_hours BIGINT NOT NULL DEFAULT 0,

  watched_seconds INT NOT NULL DEFAULT 0,

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT,

  CONSTRAINT uq_extra_completion UNIQUE (session_id, application_id),

  CONSTRAINT fk_extra_completion_session
    FOREIGN KEY (session_id) REFERENCES extra_curricular_session(session_id),

  CONSTRAINT fk_extra_completion_application
    FOREIGN KEY (application_id) REFERENCES extra_curricular_application(application_id),

  CONSTRAINT fk_extra_completion_created_by
    FOREIGN KEY (created_by) REFERENCES account(account_id),

  CONSTRAINT fk_extra_completion_updated_by
    FOREIGN KEY (updated_by) REFERENCES account(account_id),

  CONSTRAINT ck_extra_completion_watched_seconds_non_negative
    CHECK (watched_seconds >= 0),

  CONSTRAINT ck_extra_completion_earned_point_non_negative
    CHECK (earned_point >= 0),

  CONSTRAINT ck_extra_completion_earned_hours_non_negative
    CHECK (earned_hours >= 0)
);

CREATE INDEX idx_extra_completion_application_id ON extra_curricular_session_completion(application_id);
CREATE INDEX idx_extra_completion_session_id ON extra_curricular_session_completion(session_id);
