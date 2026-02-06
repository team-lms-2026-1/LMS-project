-- Add audit columns to survey_question
ALTER TABLE survey_question
    ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT now(),
    ADD COLUMN created_by BIGINT,
    ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT now(),
    ADD COLUMN updated_by BIGINT;

-- Add audit columns to survey_target
ALTER TABLE survey_target
    ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT now(),
    ADD COLUMN created_by BIGINT,
    ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT now(),
    ADD COLUMN updated_by BIGINT;

-- Add foreign key constraints for auditing columns (optional but good practice)
ALTER TABLE survey_question
    ADD CONSTRAINT fk_survey_question_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
    ADD CONSTRAINT fk_survey_question_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id);

ALTER TABLE survey_target
    ADD CONSTRAINT fk_survey_target_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
    ADD CONSTRAINT fk_survey_target_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id);
