-- V6__community.sql
-- =====================================================
-- V3__community_features.sql
-- Community (Notice / Resource / FAQ / Q&A)
-- Depends on: V2__account_auth_and_log (account table)
-- =====================================================

-- =====================================================
-- 1. Notice (공지사항)
-- =====================================================

-- 공지사항 카테고리
CREATE TABLE notice_category (
  category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  bg_color_hex VARCHAR(7) NOT NULL DEFAULT '#EEF2FF',
  text_color_hex VARCHAR(7) NOT NULL DEFAULT '#1E3A8A',
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT NOT NULL,

  CONSTRAINT fk_notice_category_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
  CONSTRAINT fk_notice_category_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id)
);

-- 공지사항 본문
CREATE TABLE notice (
  notice_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id BIGINT NOT NULL,
  
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  
  display_start_at TIMESTAMP,
  display_end_at TIMESTAMP,
  
  view_count INT NOT NULL DEFAULT 0,
  author_account_id BIGINT NOT NULL, -- 기존 account 테이블 참조
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT NOT NULL, 
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT NOT NULL, 
  
  CONSTRAINT fk_notice_category 
    FOREIGN KEY (category_id) REFERENCES notice_category(category_id),
    
  -- 이미 존재하는 account 테이블과 연결
  CONSTRAINT fk_notice_account 
    FOREIGN KEY (author_account_id) REFERENCES account(account_id),

  CONSTRAINT fk_notice_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
  CONSTRAINT fk_notice_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id)
);

CREATE INDEX idx_notice_category ON notice (category_id);
CREATE INDEX idx_notice_created_at ON notice (created_at);

-- 공지사항 첨부파일
CREATE TABLE notice_attachment (
  attachment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  notice_id BIGINT NOT NULL,
  
  storage_key VARCHAR(255) NOT NULL UNIQUE,
  original_name VARCHAR(255) NOT NULL,
  content_type VARCHAR(100),
  file_size BIGINT,
  
--  Uploaded (생성/업로드)
  uploaded_at TIMESTAMP NOT NULL DEFAULT now(),
  uploaded_by BIGINT NOT NULL,

  --  Updated (수정/메타데이터 변경)
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT NOT NULL,

  CONSTRAINT fk_notice_attachment_notice 
    FOREIGN KEY (notice_id) REFERENCES notice(notice_id)
    --  작성자(업로더) 및 수정자 외래키 연결
  CONSTRAINT fk_notice_attachment_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES account(account_id),
  CONSTRAINT fk_notice_attachment_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id)
);
CREATE INDEX idx_notice_attachment_notice ON notice_attachment (notice_id);


-- =====================================================
-- 2. Resource (자료실)
-- =====================================================

-- 자료실 카테고리
CREATE TABLE resource_category (
  category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  bg_color_hex VARCHAR(7) NOT NULL DEFAULT '#EEF2FF',
  text_color_hex VARCHAR(7) NOT NULL DEFAULT '#1E3A8A',
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT NOT NULL,

  CONSTRAINT fk_resource_category_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
  CONSTRAINT fk_resource_category_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id)
);

-- 자료실 게시글
CREATE TABLE resource_post (
  resource_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id BIGINT NOT NULL,
  
  title VARCHAR(255) NOT NULL,
  content TEXT,
  
  view_count INT NOT NULL DEFAULT 0,
  author_account_id BIGINT NOT NULL, -- 기존 account 테이블 참조
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT NOT NULL,

  CONSTRAINT fk_resource_category 
    FOREIGN KEY (category_id) REFERENCES resource_category(category_id),
    
  --  이미 존재하는 account 테이블과 연결
  CONSTRAINT fk_resource_account 
    FOREIGN KEY (author_account_id) REFERENCES account(account_id),
  
  CONSTRAINT fk_resource_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
  CONSTRAINT fk_resource_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id)
);
CREATE INDEX idx_resource_category ON resource_post (category_id);
CREATE INDEX idx_resource_created_at ON resource_post (created_at);

-- 자료실 첨부파일
CREATE TABLE resource_attachment (
  attachment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  resource_id BIGINT NOT NULL,
  
  storage_key VARCHAR(255) NOT NULL UNIQUE,
  original_name VARCHAR(255) NOT NULL,
  content_type VARCHAR(100),
  file_size BIGINT,
  
--  Uploaded (업로드 정보)
  uploaded_at TIMESTAMP NOT NULL DEFAULT now(),
  uploaded_by BIGINT NOT NULL,
  
  --  Updated (수정 정보)
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT NOT NULL,

  CONSTRAINT fk_resource_attachment_post 
    FOREIGN KEY (resource_id) REFERENCES resource_post(resource_id),

  --  계정 테이블과 연결 (업로더 및 수정자)
  CONSTRAINT fk_resource_attachment_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES account(account_id),
  CONSTRAINT fk_resource_attachment_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id)
);
CREATE INDEX idx_resource_attachment_post ON resource_attachment (resource_id);


-- =====================================================
-- 3. FAQ (자주 묻는 질문)
-- =====================================================

-- FAQ 카테고리
CREATE TABLE faq_category (
  category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  bg_color_hex VARCHAR(7) NOT NULL DEFAULT '#EEF2FF',
  text_color_hex VARCHAR(7) NOT NULL DEFAULT '#1E3A8A',
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT NOT NULL,

  CONSTRAINT fk_faq_category_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
  CONSTRAINT fk_faq_category_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id)
);

-- FAQ 본문
CREATE TABLE faq (
  faq_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id BIGINT NOT NULL,
  
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  
  view_count INT NOT NULL DEFAULT 0,
  author_account_id BIGINT NOT NULL, -- 기존 account 테이블 참조
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT NOT NULL,

  CONSTRAINT fk_faq_category 
    FOREIGN KEY (category_id) REFERENCES faq_category(category_id),
    
  --  이미 존재하는 account 테이블과 연결
  CONSTRAINT fk_faq_account 
    FOREIGN KEY (author_account_id) REFERENCES account(account_id),

  CONSTRAINT fk_faq_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
  CONSTRAINT fk_faq_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id)
);
CREATE INDEX idx_faq_category ON faq (category_id);


-- =====================================================
-- 4. QnA (묻고 답하기)
-- =====================================================

-- QnA 카테고리
CREATE TABLE qna_category (
  category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  bg_color_hex VARCHAR(7) NOT NULL DEFAULT '#EEF2FF',
  text_color_hex VARCHAR(7) NOT NULL DEFAULT '#1E3A8A',
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT now()
  updated_by BIGINT NOT NULL,

  CONSTRAINT fk_qna_category_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
  CONSTRAINT fk_qna_category_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id)
);

-- QnA 질문
CREATE TABLE qna_question (
  question_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id BIGINT NOT NULL,
  
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  
  view_count INT NOT NULL DEFAULT 0,
  author_account_id BIGINT NOT NULL, -- 기존 account 테이블 참조
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT NOT NULL,

  CONSTRAINT fk_qna_category 
    FOREIGN KEY (category_id) REFERENCES qna_category(category_id),
    
  -- ✅ 이미 존재하는 account 테이블과 연결
  CONSTRAINT fk_qna_question_account 
    FOREIGN KEY (author_account_id) REFERENCES account(account_id),

  CONSTRAINT fk_qna_question_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
  CONSTRAINT fk_qna_question_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id)
);
CREATE INDEX idx_qna_category ON qna_question (category_id);
CREATE INDEX idx_qna_created_at ON qna_question (created_at);

-- QnA 답변
CREATE TABLE qna_answer (
  answer_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question_id BIGINT NOT NULL UNIQUE, -- 1:1 관계 (질문 하나에 답변 하나)
  
  content TEXT NOT NULL,
  author_account_id BIGINT NOT NULL, -- 답변자(관리자/교수 등) ID
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT NOT NULL,

  CONSTRAINT fk_qna_answer_question 
    FOREIGN KEY (question_id) REFERENCES qna_question(question_id),
    
  -- ✅ 이미 존재하는 account 테이블과 연결
  CONSTRAINT fk_qna_answer_account 
    FOREIGN KEY (author_account_id) REFERENCES account(account_id),

  CONSTRAINT fk_qna_answer_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
  CONSTRAINT fk_qna_answer_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id)
);