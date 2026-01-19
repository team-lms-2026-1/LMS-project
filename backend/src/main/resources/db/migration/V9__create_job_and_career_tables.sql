-- ==========================================
-- 1. 고용24 (워크넷) 데이터 테이블
-- ==========================================

-- 1.1 기업 정보 (Companies)
CREATE TABLE companies (
    biz_no          VARCHAR(20) PRIMARY KEY,    -- 사업자번호
    company_name    VARCHAR(255) NOT NULL,      -- 기업명
    ceo_name        VARCHAR(100),               -- 대표자명
    company_type    VARCHAR(50),                -- 기업 형태
    industry_code   VARCHAR(50),                -- 업종코드
    main_business   TEXT,                       -- 주요 사업 내용
    address         VARCHAR(500),               -- 주소
    website         VARCHAR(255),               -- 홈페이지
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- 1.2 직업 사전 (Job Dictionary)
CREATE TABLE job_dictionary (
    job_code        VARCHAR(20) PRIMARY KEY,    -- 직업코드
    job_title       VARCHAR(255) NOT NULL,      -- 직업명
    job_summary     TEXT,                       -- 직업 개요
    avg_salary      VARCHAR(100),               -- 평균 임금 (문자열)
    prospects       VARCHAR(100),               -- 전망
    created_at      TIMESTAMP DEFAULT NOW()
);

-- 1.3 채용 공고 (Job Postings)
CREATE TABLE job_postings (
    posting_id      VARCHAR(50) PRIMARY KEY,    -- 공고 ID (wantedAuthNo)
    
    -- 외래키 (FK)
    biz_no          VARCHAR(20),
    job_code        VARCHAR(20),
    
    title           VARCHAR(255) NOT NULL,      -- 공고 제목
    salary_type     VARCHAR(50),                -- 급여 형태 (연봉/월급)
    salary_amount   VARCHAR(100),               -- 급여 금액
    work_region     VARCHAR(100),               -- 근무 지역
    min_education   VARCHAR(100),               -- 최소 학력
    
    reg_date        DATE,                       -- 등록일
    close_date      DATE,                       -- 마감일
    is_active       BOOLEAN DEFAULT TRUE,       -- 진행 여부
    
    detail_url      TEXT,                       -- 워크넷 상세 URL
    crawled_at      TIMESTAMP DEFAULT NOW(),    -- 수집 시점

    -- 제약 조건
    CONSTRAINT fk_postings_company FOREIGN KEY (biz_no) REFERENCES companies (biz_no),
    CONSTRAINT fk_postings_job FOREIGN KEY (job_code) REFERENCES job_dictionary (job_code)
);

-- ==========================================
-- 2. 커리어넷 (진로심리검사) 데이터 테이블
-- ==========================================

-- 2.1 심리검사 메타 정보 (Career Tests)
CREATE TABLE career_tests (
    test_seq        VARCHAR(20) PRIMARY KEY,    -- 검사 고유번호 (aplySeq)
    test_name       VARCHAR(255) NOT NULL,      -- 검사명
    target_group    VARCHAR(50),                -- 대상
    item_count      INTEGER,                    -- 문항 수
    description     TEXT,                       -- 설명
    start_url       VARCHAR(500)                -- 검사 시작 URL
);

-- 2.2 검사 문항 (Test Questions)
CREATE TABLE test_questions (
    question_id     BIGSERIAL PRIMARY KEY,      -- 자동 증가 ID
    test_seq        VARCHAR(20) NOT NULL,       -- 검사 FK
    q_item_no       INTEGER,                    -- 문항 번호
    question_text   TEXT,                       -- 질문 내용
    answer_options  JSONB,                      -- 답변 보기 (Postgres JSONB 타입 사용)

    CONSTRAINT fk_questions_test FOREIGN KEY (test_seq) REFERENCES career_tests (test_seq)
);

-- ==========================================
-- 3. 사용자 검사 이력 및 결과
-- ==========================================

-- 3.1 사용자 검사 이력 (User Test History)
CREATE TABLE user_test_history (
    history_id      BIGSERIAL PRIMARY KEY,
    
    -- 외래키
    account_id      BIGINT NOT NULL,            -- 기존 Account 테이블 연결
    test_seq        VARCHAR(20) NOT NULL,       -- 실시한 검사
    
    score_summary   TEXT,                       -- 결과 요약 (JSON 문자열 등)
    test_date       TIMESTAMP DEFAULT NOW(),    -- 검사 일시

    CONSTRAINT fk_history_account FOREIGN KEY (account_id) REFERENCES account (account_id),
    CONSTRAINT fk_history_test FOREIGN KEY (test_seq) REFERENCES career_tests (test_seq)
);

-- 3.2 검사 결과 추천 직업 (Test Job Recommendations)
CREATE TABLE test_job_recommendations (
    recommend_id    BIGSERIAL PRIMARY KEY,
    history_id      BIGINT NOT NULL,            -- 이력 FK
    job_code        VARCHAR(20),                -- 직업 사전 FK (연결 가능할 경우)
    
    job_name        VARCHAR(255),               -- 추천 직업명
    rank_order      INTEGER,                    -- 순위

    CONSTRAINT fk_recommend_history FOREIGN KEY (history_id) REFERENCES user_test_history (history_id) ON DELETE CASCADE,
    CONSTRAINT fk_recommend_job FOREIGN KEY (job_code) REFERENCES job_dictionary (job_code)
);

-- 인덱스 추가 (검색 성능 향상을 위해 권장)
CREATE INDEX idx_postings_biz_no ON job_postings(biz_no);
CREATE INDEX idx_postings_job_code ON job_postings(job_code);
CREATE INDEX idx_history_account_id ON user_test_history(account_id); 