-- =======================================================
-- MBTI Schema (Updated for A/B Scoring)
-- =======================================================

-- 기존 테이블이 있다면 DROP (개발 중이므로 재생성 가정)
DROP TABLE IF EXISTS mbti_choice CASCADE;
DROP TABLE IF EXISTS mbti_question CASCADE;
DROP TABLE IF EXISTS mbti_result CASCADE;

CREATE TABLE mbti_question (
    question_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    content       TEXT         NOT NULL,
    dimension     VARCHAR(10)  NOT NULL, -- EI, SN, TF, JP
    sort_order    INT          NOT NULL,
    
    -- Auditing
    created_at    TIMESTAMP    NOT NULL DEFAULT now(),
    created_by    BIGINT,
    updated_at    TIMESTAMP    NOT NULL DEFAULT now(),
    updated_by    BIGINT
);

CREATE TABLE mbti_choice (
    choice_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question_id   BIGINT       NOT NULL,
    content       VARCHAR(255) NOT NULL,
    
    -- A/B 점수 (Dimension에 따라 의미가 달라짐)
    -- 예: Dimension=EI -> score_a=E점수, score_b=I점수
    score_a       INT          NOT NULL DEFAULT 0,
    score_b       INT          NOT NULL DEFAULT 0,
    
    -- Auditing
    created_at    TIMESTAMP    NOT NULL DEFAULT now(),
    created_by    BIGINT,
    updated_at    TIMESTAMP    NOT NULL DEFAULT now(),
    updated_by    BIGINT,

    CONSTRAINT fk_choice_question 
        FOREIGN KEY (question_id) REFERENCES mbti_question(question_id) ON DELETE CASCADE
);

CREATE TABLE mbti_result (
    result_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id    BIGINT       NOT NULL,
    mbti_type     VARCHAR(10)  NOT NULL, -- INTJ, ENFP etc
    
    e_score       INT DEFAULT 0,
    i_score       INT DEFAULT 0,
    s_score       INT DEFAULT 0,
    n_score       INT DEFAULT 0,
    t_score       INT DEFAULT 0,
    f_score       INT DEFAULT 0,
    j_score       INT DEFAULT 0,
    p_score       INT DEFAULT 0,

    -- Auditing
    created_at    TIMESTAMP    NOT NULL DEFAULT now(),
    created_by    BIGINT,
    updated_at    TIMESTAMP    NOT NULL DEFAULT now(),
    updated_by    BIGINT
);

CREATE INDEX idx_mbti_result_account ON mbti_result(account_id, created_at DESC);
