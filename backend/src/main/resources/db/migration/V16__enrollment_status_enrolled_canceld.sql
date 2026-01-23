-- V16__enrollment_status_enrolled_canceled.sql

ALTER TABLE enrollment
DROP CONSTRAINT ck_enrollment_status;

ALTER TABLE enrollment
ADD CONSTRAINT ck_enrollment_status
CHECK (enrollment_status IN ('ENROLLED','CANCELED'));
