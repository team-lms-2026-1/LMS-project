-- Add choice labels and scores to diagnosis_question table
ALTER TABLE diagnosis_question ADD COLUMN label1 VARCHAR(255);
ALTER TABLE diagnosis_question ADD COLUMN label2 VARCHAR(255);
ALTER TABLE diagnosis_question ADD COLUMN label3 VARCHAR(255);
ALTER TABLE diagnosis_question ADD COLUMN label4 VARCHAR(255);
ALTER TABLE diagnosis_question ADD COLUMN label5 VARCHAR(255);

ALTER TABLE diagnosis_question ADD COLUMN score1 INT DEFAULT 1;
ALTER TABLE diagnosis_question ADD COLUMN score2 INT DEFAULT 2;
ALTER TABLE diagnosis_question ADD COLUMN score3 INT DEFAULT 3;
ALTER TABLE diagnosis_question ADD COLUMN score4 INT DEFAULT 4;
ALTER TABLE diagnosis_question ADD COLUMN score5 INT DEFAULT 5;
