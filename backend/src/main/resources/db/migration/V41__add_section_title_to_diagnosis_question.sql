-- Add missing section_title column to diagnosis_question table
ALTER TABLE diagnosis_question ADD COLUMN section_title VARCHAR(255);
