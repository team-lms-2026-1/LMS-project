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

-- Add survey_type_config table
CREATE TABLE IF NOT EXISTS survey_type_config (
    type_code VARCHAR(50) PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Seed initial survey types
INSERT INTO survey_type_config (type_code, type_name, sort_order) VALUES
('SATISFACTION', '만족도 조사', 1),
('COURSE', '수강 설문', 2),
('SERVICE', '서비스 이용 조사', 3),
('ETC', '기타', 4)
ON CONFLICT (type_code) DO NOTHING;
