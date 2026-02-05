-- =======================================================
-- Extra Offering Competency Map (offering 기준으로 재구성)
-- 기존 extra_curricular_competency_map(프로그램 기준)은 삭제
-- =======================================================

-- 0) 혹시 이전에 rename 하다가 남은 offering 테이블이 있으면 먼저 제거 (있을 수도 있어서 안전하게)
DROP TABLE IF EXISTS extra_curricular_offering_competency_map CASCADE;

-- 1) 기존 프로그램 기준 테이블 삭제
DROP TABLE IF EXISTS extra_curricular_competency_map CASCADE;

-- 2) offering 기준 테이블 생성
CREATE TABLE extra_curricular_offering_competency_map (
    extra_offering_id BIGINT NOT NULL,
    competency_id     BIGINT NOT NULL,
    weight            INT    NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_by BIGINT,

    CONSTRAINT pk_ecocm PRIMARY KEY (extra_offering_id, competency_id),

    CONSTRAINT fk_ecocm_offering
        FOREIGN KEY (extra_offering_id)
        REFERENCES extra_curricular_offering(extra_offering_id),

    CONSTRAINT fk_ecocm_competency
        FOREIGN KEY (competency_id)
        REFERENCES competency(competency_id),

    CONSTRAINT fk_ecocm_created_by
        FOREIGN KEY (created_by) REFERENCES account(account_id),

    CONSTRAINT fk_ecocm_updated_by
        FOREIGN KEY (updated_by) REFERENCES account(account_id)
);

CREATE INDEX idx_ecocm_competency_id
    ON extra_curricular_offering_competency_map(competency_id);
