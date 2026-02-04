-- 1. 진단 실행 마스터 (Diagnosis Run)
CREATE TABLE diagnosis_run (
    run_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    semester_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL, -- DRAFT | OPEN | CLOSED
    
    -- Audit Columns
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_by BIGINT,

    CONSTRAINT uq_run_semester UNIQUE (semester_id),
    CONSTRAINT fk_run_semester FOREIGN KEY (semester_id) REFERENCES semester(semester_id),
    CONSTRAINT fk_run_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
    CONSTRAINT fk_run_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id)
);

-- 2. 진단 대상자 목록
CREATE TABLE diagnosis_target (
    target_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    run_id BIGINT NOT NULL,
    student_account_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING | SUBMITTED
    registered_at TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT uq_target_run_student UNIQUE (run_id, student_account_id),
    CONSTRAINT fk_target_run FOREIGN KEY (run_id) REFERENCES diagnosis_run(run_id),
    CONSTRAINT fk_target_student FOREIGN KEY (student_account_id) REFERENCES account(account_id)
);

-- 3. 진단 문항 (Diagnosis Question)
CREATE TABLE diagnosis_question (
    question_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    run_id BIGINT NOT NULL,
    domain VARCHAR(20) NOT NULL, -- SKILL | APTITUDE
    question_type VARCHAR(20) NOT NULL, -- SCALE | SHORT
    content TEXT NOT NULL,
    sort_order INT NOT NULL,
    short_answer_key VARCHAR(255),
    
    c1_max_score INT NOT NULL DEFAULT 0,
    c2_max_score INT NOT NULL DEFAULT 0,
    c3_max_score INT NOT NULL DEFAULT 0,
    c4_max_score INT NOT NULL DEFAULT 0,
    c5_max_score INT NOT NULL DEFAULT 0,
    c6_max_score INT NOT NULL DEFAULT 0,

    -- Audit Columns
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_by BIGINT,

    CONSTRAINT uq_question_run_order UNIQUE (run_id, sort_order),
    CONSTRAINT fk_question_run FOREIGN KEY (run_id) REFERENCES diagnosis_run(run_id),
    CONSTRAINT fk_question_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
    CONSTRAINT fk_question_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id)
);

-- 4. 진단 제출 기록 (Diagnosis Submission)
CREATE TABLE diagnosis_submission (
    submission_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    run_id BIGINT NOT NULL,
    student_account_id BIGINT NOT NULL,
    submitted_at TIMESTAMP NOT NULL DEFAULT now(),

    -- Audit Columns (제출은 보통 수정되지 않으나 생성자 기록을 위해 추가)
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_by BIGINT,

    CONSTRAINT uq_submission_run_student UNIQUE (run_id, student_account_id),
    CONSTRAINT fk_submission_run FOREIGN KEY (run_id) REFERENCES diagnosis_run(run_id),
    CONSTRAINT fk_submission_student FOREIGN KEY (student_account_id) REFERENCES account(account_id),
    CONSTRAINT fk_submission_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
    CONSTRAINT fk_submission_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id)
);



-- 5. 문항별 상세 답변 (Diagnosis Answer)
CREATE TABLE diagnosis_answer (
    answer_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    submission_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    scale_value INT, 
    short_text TEXT,
    is_correct BOOLEAN,
    
    -- Audit Columns
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_by BIGINT,

    CONSTRAINT uq_answer_submission_question UNIQUE (submission_id, question_id),
    CONSTRAINT fk_answer_submission FOREIGN KEY (submission_id) REFERENCES diagnosis_submission(submission_id),
    CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES diagnosis_question(question_id),
    CONSTRAINT fk_answer_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
    CONSTRAINT fk_answer_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id)
);





-- 6. 비교과 매핑
CREATE TABLE extra_curricular_competency_map (
    extra_curricular_id BIGINT NOT NULL,
    competency_id BIGINT NOT NULL,
    weight BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT pk_eccm PRIMARY KEY (extra_curricular_id, competency_id),
    CONSTRAINT fk_eccm_extra FOREIGN KEY (extra_curricular_id) REFERENCES extra_curricular(extra_curricular_id),
    CONSTRAINT fk_eccm_competency FOREIGN KEY (competency_id) REFERENCES competency(competency_id)
);



-- 7. 학생별 학기별 역량 요약 (Semester Student Summary)
CREATE TABLE semester_student_competency_summary (
    summary_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    semester_id BIGINT NOT NULL,
    student_account_id BIGINT NOT NULL,
    competency_id BIGINT NOT NULL,

    diagnosis_skill_score NUMERIC NOT NULL DEFAULT 0,
    diagnosis_aptitude_score NUMERIC NOT NULL DEFAULT 0,
    diagnosis_score NUMERIC NOT NULL DEFAULT 0,
    curricular_score NUMERIC NOT NULL DEFAULT 0,
    extra_score NUMERIC NOT NULL DEFAULT 0,
    self_extra_score NUMERIC NOT NULL DEFAULT 0,
    total_score NUMERIC NOT NULL DEFAULT 0,

    calculated_at TIMESTAMP NOT NULL DEFAULT now(),

    -- Audit Columns (계산 이력 추적용)
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_by BIGINT,

    CONSTRAINT uq_summary_semester_student_competency UNIQUE (semester_id, student_account_id, competency_id),
    CONSTRAINT fk_summary_semester FOREIGN KEY (semester_id) REFERENCES semester(semester_id),
    CONSTRAINT fk_summary_account FOREIGN KEY (student_account_id) REFERENCES account(account_id),
    CONSTRAINT fk_summary_competency FOREIGN KEY (competency_id) REFERENCES competency(competency_id),
    CONSTRAINT fk_summary_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
    CONSTRAINT fk_summary_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id)
);


-- 8. 학기별 역량 코호트 통계 (Semester Competency Stat)
CREATE TABLE semester_competency_cohort_stat (
    stat_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    semester_id BIGINT NOT NULL,
    competency_id BIGINT NOT NULL,
    target_count INT NOT NULL,
    calculated_count INT NOT NULL,
    mean NUMERIC NOT NULL,
    median NUMERIC,
    stddev NUMERIC,
    calculated_at TIMESTAMP NOT NULL DEFAULT now(),

    -- Audit Columns
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_by BIGINT,

    CONSTRAINT uq_stat_semester_competency UNIQUE (semester_id, competency_id),
    CONSTRAINT fk_stat_semester FOREIGN KEY (semester_id) REFERENCES semester(semester_id),
    CONSTRAINT fk_stat_competency FOREIGN KEY (competency_id) REFERENCES competency(competency_id),
    CONSTRAINT fk_stat_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
    CONSTRAINT fk_stat_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id)
);