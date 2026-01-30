-- =======================================================
-- 1. 설문 (Survey)
-- =======================================================
CREATE TABLE survey (
    survey_id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    
    survey_type            VARCHAR(20)  NOT NULL, -- SATISFACTION | COURSE | SERVICE | ETC
    title                  VARCHAR(255) NOT NULL,
    description            TEXT,
    
    start_at             TIMESTAMP    NOT NULL,
    end_at               TIMESTAMP    NOT NULL,
    
    status                 VARCHAR(20)  NOT NULL DEFAULT 'DRAFT', -- DRAFT | OPEN | CLOSED
    
    -- 대상자 생성 방식
    target_gen_type        VARCHAR(20)  NOT NULL DEFAULT 'MIXED', -- ALL | DEPT | USER | MIXED
    target_condition_memo  VARCHAR(500),
    
    -- Auditing
    created_at             TIMESTAMP    NOT NULL DEFAULT now(),
    created_by             BIGINT,
    updated_at             TIMESTAMP    NOT NULL DEFAULT now(),
    updated_by             BIGINT, 

    -- Constraints
    CONSTRAINT fk_survey_created_by 
        FOREIGN KEY (created_by) REFERENCES account(account_id)
);

-- 인덱스 설정
CREATE INDEX idx_survey_type ON survey(survey_type);
CREATE INDEX idx_survey_status ON survey(status);
CREATE INDEX idx_survey_period ON survey(start_at, end_at);


-- =======================================================
-- 2. 설문 문항 (Survey Question)
-- =======================================================
CREATE TABLE survey_question (
    question_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    survey_id     BIGINT       NOT NULL,
    
    question_text       TEXT         NOT NULL, -- 질문 내용
    sort_order    INT          NOT NULL,
    
    -- 척도 설정
    min_val     INT          NOT NULL DEFAULT 1,
    max_val     INT          NOT NULL DEFAULT 5,
    min_label     VARCHAR(50), -- 예: 매우 불만
    max_label     VARCHAR(50), -- 예: 매우 만족
    
    is_required   BOOLEAN      NOT NULL DEFAULT true,

    -- Constraints
    CONSTRAINT fk_question_survey 
        FOREIGN KEY (survey_id) REFERENCES survey(survey_id) ON DELETE CASCADE,
        
    CONSTRAINT uq_question_survey_order 
        UNIQUE (survey_id, sort_order)
);


-- =======================================================
-- 3. 설문 대상자 및 응답 (Survey Target)
-- =======================================================
CREATE TABLE survey_target (
    target_id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    survey_id         BIGINT       NOT NULL,
    target_account_id BIGINT       NOT NULL, -- 대상 계정 (student, professor etc.)
    
    -- 상태 및 시간
    status            VARCHAR(20)  NOT NULL DEFAULT 'PENDING', -- PENDING | IN_PROGRESS | SUBMITTED
    invited_at        TIMESTAMP    NOT NULL DEFAULT now(),
    submitted_at      TIMESTAMP,
    last_saved_at     TIMESTAMP,
    
    -- ✅ 응답 데이터 (JSON)
    -- PostgreSQL에서는 JSONB 타입을 권장 (검색 및 인덱싱 효율)
    -- 예: {"101": 5, "102": 3} (Key: question_id, Value: scale_value)
    response_json     JSONB, 

    -- Constraints
    CONSTRAINT fk_target_survey 
        FOREIGN KEY (survey_id) REFERENCES survey(survey_id) ON DELETE CASCADE,
        
    CONSTRAINT fk_target_account 
        FOREIGN KEY (target_account_id) REFERENCES account(account_id),
        
    CONSTRAINT uq_target_survey_account 
        UNIQUE (survey_id, target_account_id)
);

-- 인덱스 설정 (실시간 현황 집계용)
CREATE INDEX idx_target_survey_status ON survey_target(survey_id, status);