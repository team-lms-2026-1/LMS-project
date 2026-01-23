-- V13__semester_add_display_name.sql

ALTER TABLE semester
  ADD COLUMN display_name VARCHAR(20) NOT NULL;

ALTER TABLE semester
  ADD CONSTRAINT uq_semester_display_name UNIQUE (display_name);
