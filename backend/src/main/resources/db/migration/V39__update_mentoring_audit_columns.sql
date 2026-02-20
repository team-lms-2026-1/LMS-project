-- Mentoring Question
ALTER TABLE mentoring_question RENAME COLUMN writer_id TO created_by;
ALTER TABLE mentoring_question ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT now();
ALTER TABLE mentoring_question ADD COLUMN updated_by BIGINT;

-- Foreign key for mentoring_question
ALTER TABLE mentoring_question
    ADD CONSTRAINT fk_mentoring_question_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
    ADD CONSTRAINT fk_mentoring_question_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id);


-- Mentoring Answer
ALTER TABLE mentoring_answer RENAME COLUMN writer_id TO created_by;
ALTER TABLE mentoring_answer ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT now();
ALTER TABLE mentoring_answer ADD COLUMN updated_by BIGINT;

-- Foreign key for mentoring_answer
ALTER TABLE mentoring_answer
    ADD CONSTRAINT fk_mentoring_answer_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
    ADD CONSTRAINT fk_mentoring_answer_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id);
