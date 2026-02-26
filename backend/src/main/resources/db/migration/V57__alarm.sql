-- =====================================================
-- V36__alarm.sql
-- Alarm (Notification)
-- =====================================================

CREATE TABLE alarm (
  alarm_id BIGSERIAL PRIMARY KEY,

  recipient_account_id BIGINT NOT NULL,
  alarm_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  link_url VARCHAR(500),
  read_at TIMESTAMP,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by BIGINT,

  CONSTRAINT fk_alarm_recipient
    FOREIGN KEY (recipient_account_id) REFERENCES account(account_id)
);

CREATE INDEX idx_alarm_recipient_created
  ON alarm (recipient_account_id, created_at DESC);

CREATE INDEX idx_alarm_recipient_read
  ON alarm (recipient_account_id, read_at);
