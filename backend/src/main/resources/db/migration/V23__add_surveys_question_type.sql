-- Add question_type column
ALTER TABLE survey_question
ADD COLUMN question_type VARCHAR(50) NOT NULL DEFAULT 'RATING',
ADD COLUMN options_json JSONB;

ALTER TABLE survey ADD COLUMN view_count BIGINT DEFAULT 0 NOT NULL;
