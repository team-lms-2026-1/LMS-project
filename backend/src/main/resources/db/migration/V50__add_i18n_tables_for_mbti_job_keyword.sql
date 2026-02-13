-- =======================================================
-- V50__add_i18n_tables_for_mbti_job_keyword.sql
-- i18n (Internationalization) Tables for Multilingual Support
-- =======================================================

-- ============================================================
-- 1. MBTI Question i18n Table
-- ============================================================

CREATE TABLE IF NOT EXISTS mbti_question_i18n (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question_id     BIGINT          NOT NULL,
    locale          VARCHAR(10)     NOT NULL,  -- ko, en, ja
    content         TEXT            NOT NULL,
    
    -- Auditing
    created_at      TIMESTAMP       NOT NULL DEFAULT now(),
    created_by      BIGINT,
    updated_at      TIMESTAMP       NOT NULL DEFAULT now(),
    updated_by      BIGINT,
    
    -- Constraints
    CONSTRAINT uk_mbti_question_locale 
        UNIQUE (question_id, locale),
    CONSTRAINT fk_mbti_question_i18n 
        FOREIGN KEY (question_id) 
        REFERENCES mbti_question(question_id) ON DELETE CASCADE
);

CREATE INDEX idx_mbti_question_i18n_locale 
    ON mbti_question_i18n(question_id, locale);


-- ============================================================
-- 2. MBTI Choice i18n Table
-- ============================================================

CREATE TABLE IF NOT EXISTS mbti_choice_i18n (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    choice_id       BIGINT          NOT NULL,
    locale          VARCHAR(10)     NOT NULL,  -- ko, en, ja
    content         VARCHAR(255)    NOT NULL,
    
    -- Auditing
    created_at      TIMESTAMP       NOT NULL DEFAULT now(),
    created_by      BIGINT,
    updated_at      TIMESTAMP       NOT NULL DEFAULT now(),
    updated_by      BIGINT,
    
    -- Constraints
    CONSTRAINT uk_mbti_choice_locale 
        UNIQUE (choice_id, locale),
    CONSTRAINT fk_mbti_choice_i18n 
        FOREIGN KEY (choice_id) 
        REFERENCES mbti_choice(choice_id) ON DELETE CASCADE
);

CREATE INDEX idx_mbti_choice_i18n_locale 
    ON mbti_choice_i18n(choice_id, locale);


-- ============================================================
-- 3. Job Catalog i18n Table
-- ============================================================

CREATE TABLE IF NOT EXISTS job_catalog_i18n (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id          BIGINT          NOT NULL,
    locale          VARCHAR(10)     NOT NULL,  -- ko, en, ja
    
    job_name        VARCHAR(300)    NOT NULL,
    major_name      VARCHAR(200),
    middle_name     VARCHAR(200),
    minor_name      VARCHAR(200),
    
    -- Search optimization
    search_text     TEXT            NOT NULL,
    
    -- Auditing
    created_at      TIMESTAMP       NOT NULL DEFAULT now(),
    created_by      BIGINT,
    updated_at      TIMESTAMP       NOT NULL DEFAULT now(),
    updated_by      BIGINT,
    
    -- Constraints
    CONSTRAINT uk_job_catalog_locale 
        UNIQUE (job_id, locale),
    CONSTRAINT fk_job_catalog_i18n 
        FOREIGN KEY (job_id) 
        REFERENCES job_catalog(id) ON DELETE CASCADE
);

CREATE INDEX idx_job_catalog_i18n_locale 
    ON job_catalog_i18n(job_id, locale);

-- 검색 성능 향상 (ILIKE 최적화)
CREATE INDEX idx_job_catalog_i18n_search_text
    ON job_catalog_i18n
    USING gin (search_text gin_trgm_ops);


-- ============================================================
-- 4. Interest Keyword Master i18n Table
-- ============================================================

CREATE TABLE IF NOT EXISTS interest_keyword_master_i18n (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    keyword_id      BIGINT          NOT NULL,
    locale          VARCHAR(10)     NOT NULL,  -- ko, en, ja
    
    keyword         VARCHAR(100)    NOT NULL,
    category        VARCHAR(50),    -- 업무영역 / 업무방식 / 역량
    
    -- Auditing
    created_at      TIMESTAMP       NOT NULL DEFAULT now(),
    created_by      BIGINT,
    updated_at      TIMESTAMP       NOT NULL DEFAULT now(),
    updated_by      BIGINT,
    
    -- Constraints
    CONSTRAINT uk_interest_keyword_locale 
        UNIQUE (keyword_id, locale),
    CONSTRAINT fk_interest_keyword_i18n 
        FOREIGN KEY (keyword_id) 
        REFERENCES interest_keyword_master(id) ON DELETE CASCADE
);

CREATE INDEX idx_interest_keyword_i18n_locale 
    ON interest_keyword_master_i18n(keyword_id, locale);

CREATE INDEX idx_interest_keyword_i18n_keyword
    ON interest_keyword_master_i18n(keyword);
