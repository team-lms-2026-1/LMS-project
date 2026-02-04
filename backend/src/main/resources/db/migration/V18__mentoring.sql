-- 멘토링 모집
CREATE TABLE mentoring_recruitment (
    recruitment_id BIGSERIAL PRIMARY KEY,
    semester_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    recruit_start_at TIMESTAMP NOT NULL,
    recruit_end_at TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL, -- DRAFT, OPEN, CLOSED
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by BIGINT
);

CREATE INDEX idx_mentoring_rec_semester ON mentoring_recruitment(semester_id);
CREATE INDEX idx_mentoring_rec_status_date ON mentoring_recruitment(status, recruit_start_at);

-- 멘토링 응모
CREATE TABLE mentoring_application (
    application_id BIGSERIAL PRIMARY KEY,
    recruitment_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL, -- MENTOR, MENTEE
    status VARCHAR(50) NOT NULL, -- APPLIED, APPROVED, REJECTED, MATCHED, CANCELED
    applied_at TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP,
    processed_by BIGINT,
    reject_reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by BIGINT,
    
    CONSTRAINT uq_mentoring_app_dup UNIQUE (recruitment_id, account_id, role)
);

CREATE INDEX idx_mentoring_app_rec_role_status ON mentoring_application(recruitment_id, role, status);
CREATE INDEX idx_mentoring_app_acc_role_status ON mentoring_application(account_id, role, status);

-- 멘토링 매칭
CREATE TABLE mentoring_matching (
    matching_id BIGSERIAL PRIMARY KEY,
    recruitment_id BIGINT NOT NULL,
    mentor_application_id BIGINT NOT NULL,
    mentee_application_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL, -- ACTIVE, CANCELED, COMPLETED
    matched_at TIMESTAMP NOT NULL DEFAULT NOW(),
    matched_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by BIGINT,
    
    CONSTRAINT uq_mentoring_match_mentee UNIQUE (recruitment_id, mentee_application_id), -- 멘티는 모집당 1회 매칭
    CONSTRAINT uq_mentoring_match_pair UNIQUE (mentor_application_id, mentee_application_id)
);

CREATE INDEX idx_mentoring_match_rec_mentor ON mentoring_matching(recruitment_id, mentor_application_id);

-- 멘토링 질문
CREATE TABLE mentoring_question (
    question_id BIGSERIAL PRIMARY KEY,
    matching_id BIGINT NOT NULL,
    writer_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mentoring_q_matching_date ON mentoring_question(matching_id, created_at);

-- 멘토링 답변
CREATE TABLE mentoring_answer (
    answer_id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL,
    writer_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_mentoring_ans_question UNIQUE (question_id)
);

CREATE INDEX idx_mentoring_ans_q_date ON mentoring_answer(question_id, created_at);
