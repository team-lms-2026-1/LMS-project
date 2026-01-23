-- V16__competency_and_offering_competency_map.sql
-- 1) competency master (C1~C6)
-- 2) curricular_offering <-> competency mapping (weight 1~6, offering 단위 중복 금지, 항상 6개 입력 전제)

-- =====================================================
-- 1. competency (master)
-- =====================================================
CREATE TABLE competency (
  competency_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE, -- C1~C6
  name VARCHAR(100) NOT NULL,       -- English
  description VARCHAR(1000),        -- Korean
  sort_order INT NOT NULL DEFAULT 0,

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT,

  CONSTRAINT ck_competency_code CHECK (code IN ('C1','C2','C3','C4','C5','C6')),

  CONSTRAINT fk_competency_created_by
    FOREIGN KEY (created_by) REFERENCES account(account_id),

  CONSTRAINT fk_competency_updated_by
    FOREIGN KEY (updated_by) REFERENCES account(account_id)
);

-- Seed: C1~C6 (영문명/한글설명)
-- (created_by/updated_by는 시스템 시드라 NULL 허용)
INSERT INTO competency (code, name, description, sort_order)
VALUES
  ('C1', 'Critical Thinking',  '비판적으로 분석하고 근거에 기반해 판단하는 역량', 1),
  ('C2', 'Communication',      '상대와 맥락을 고려해 명확히 전달하고 경청하는 역량', 2),
  ('C3', 'Collaboration',      '공동 목표 달성을 위해 협업하고 조율하는 역량', 3),
  ('C4', 'Creativity',         '새로운 아이디어를 도출하고 문제를 창의적으로 해결하는 역량', 4),
  ('C5', 'Character',          '윤리의식과 책임감을 바탕으로 성숙하게 행동하는 역량', 5),
  ('C6', 'Citizenship',        '공동체 의식과 사회적 책임을 가지고 참여하는 역량', 6);

-- =====================================================
-- 2. curricular_offering_competency_map
--    - 운영교과(offering) 1개당 역량 6개 모두 반드시 입력
--    - weight: 1~6 (offering 단위 중복 불가)
-- =====================================================
CREATE TABLE curricular_offering_competency_map (
  offering_id BIGINT NOT NULL,
  competency_id BIGINT NOT NULL,
  weight INT NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_by BIGINT,

  CONSTRAINT pk_cocm PRIMARY KEY (offering_id, competency_id),

  CONSTRAINT fk_cocm_offering
    FOREIGN KEY (offering_id) REFERENCES curricular_offering(offering_id),

  CONSTRAINT fk_cocm_competency
    FOREIGN KEY (competency_id) REFERENCES competency(competency_id),

  -- 항상 1~6만 허용
  CONSTRAINT ck_cocm_weight_range
    CHECK (weight BETWEEN 1 AND 6),

  CONSTRAINT fk_cocm_created_by
    FOREIGN KEY (created_by) REFERENCES account(account_id),

  CONSTRAINT fk_cocm_updated_by
    FOREIGN KEY (updated_by) REFERENCES account(account_id)
);

-- offering 내에서 weight 중복 금지 (항상 1~6이므로 부분 조건 불필요)
CREATE UNIQUE INDEX uq_cocm_offering_weight
  ON curricular_offering_competency_map (offering_id, weight);

CREATE INDEX idx_cocm_competency_id
  ON curricular_offering_competency_map (competency_id);