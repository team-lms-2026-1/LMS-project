-- Add alarm_sent_at to notice and mark existing notices as sent
ALTER TABLE notice
  ADD COLUMN alarm_sent_at TIMESTAMP;

UPDATE notice
  SET alarm_sent_at = NOW()
  WHERE alarm_sent_at IS NULL;
