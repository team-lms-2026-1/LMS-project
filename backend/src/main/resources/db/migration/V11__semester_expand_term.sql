-- V11__semester_expand_term.sql

-- 1) CHECK 제약 변경 (기존 제약 삭제 후 재생성)
ALTER TABLE semester
  DROP CONSTRAINT ck_semester_term;

ALTER TABLE semester
  ADD CONSTRAINT ck_semester_term
  CHECK (term IN ('FIRST','SECOND','SUMMER','WINTER'));