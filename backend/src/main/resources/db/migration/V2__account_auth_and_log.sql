-- =====================================================
-- V2__account_auth_and_log.sql
-- Account / Auth / User Log Base
-- =====================================================

-- =====================================================
-- 1. Account
-- =====================================================
CREATE TABLE account (
  account_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  login_id VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,

  account_type VARCHAR(20) NOT NULL, -- STUDENT | PROFESSOR | ADMIN
  status VARCHAR(20) NOT NULL,       -- ACTIVE | INACTIVE

  last_login_at TIMESTAMP,
  password_changed_at TIMESTAMP,

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT
);

-- =====================================================
-- 2. Profiles
-- =====================================================
CREATE TABLE student_profile (
  account_id BIGINT PRIMARY KEY,
  student_no VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(30),

  grade_level INT NOT NULL,
  academic_status VARCHAR(20) NOT NULL, -- ENROLLED | DROPPED | LEAVE | GRADUATED

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT fk_student_profile_account
    FOREIGN KEY (account_id) REFERENCES account(account_id)
);

CREATE TABLE professor_profile (
  account_id BIGINT PRIMARY KEY,
  professor_no VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(30),

  dept_id BIGINT NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT fk_professor_profile_account
    FOREIGN KEY (account_id) REFERENCES account(account_id)
);

CREATE TABLE admin_profile (
  account_id BIGINT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(30),
  memo VARCHAR(255),

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT fk_admin_profile_account
    FOREIGN KEY (account_id) REFERENCES account(account_id)
);

-- =====================================================
-- 3. Auth - Permission / Role
-- =====================================================
CREATE TABLE auth_permission (
  permission_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE, -- NOTICE_READ, NOTICE_MANAGE ...
  description VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE auth_role (
  role_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE, -- ADMIN_SYSTEM, STUDENT_BASIC ...
  description VARCHAR(255),
  role_scope VARCHAR(20) NOT NULL,  -- STUDENT | PROFESSOR | ADMIN
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE auth_role_permission (
  role_id BIGINT NOT NULL,
  permission_id BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT pk_auth_role_permission PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_role_permission_role
    FOREIGN KEY (role_id) REFERENCES auth_role(role_id),
  CONSTRAINT fk_role_permission_permission
    FOREIGN KEY (permission_id) REFERENCES auth_permission(permission_id)
);

CREATE TABLE auth_account_role (
  account_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,

  assigned_at TIMESTAMP NOT NULL DEFAULT now(),
  assigned_by BIGINT,

  CONSTRAINT pk_auth_account_role PRIMARY KEY (account_id, role_id),
  CONSTRAINT fk_account_role_account
    FOREIGN KEY (account_id) REFERENCES account(account_id),
  CONSTRAINT fk_account_role_role
    FOREIGN KEY (role_id) REFERENCES auth_role(role_id),
  CONSTRAINT fk_account_role_assigned_by
    FOREIGN KEY (assigned_by) REFERENCES account(account_id)
);

-- =====================================================
-- 4. User Activity (Snapshot)
-- =====================================================
CREATE TABLE user_activity (
  account_id BIGINT PRIMARY KEY,

  first_activity_at TIMESTAMP NOT NULL,
  last_activity_at TIMESTAMP NOT NULL,

  last_request_path VARCHAR(255),
  last_ip VARCHAR(50),
  last_user_agent VARCHAR(255),

  updated_at TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT fk_user_activity_account
    FOREIGN KEY (account_id) REFERENCES account(account_id)
);

CREATE INDEX idx_user_activity_last_activity
  ON user_activity (last_activity_at);

-- =====================================================
-- 5. Account Access Log (Append-only)
-- =====================================================
CREATE TABLE account_access_log (
  log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id BIGINT NOT NULL,

  accessed_at TIMESTAMP NOT NULL,
  access_url VARCHAR(255) NOT NULL,
  ip VARCHAR(50) NOT NULL,
  os VARCHAR(50),
  user_agent VARCHAR(255),

  CONSTRAINT fk_access_log_account
    FOREIGN KEY (account_id) REFERENCES account(account_id)
);

CREATE INDEX idx_access_log_account_time
  ON account_access_log (account_id, accessed_at);

CREATE INDEX idx_access_log_time
  ON account_access_log (accessed_at);
