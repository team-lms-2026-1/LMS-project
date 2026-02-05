-- 기존 테이블명이 extra_curricular_competency_map 라면
ALTER TABLE extra_curricular_competency_map
RENAME TO extra_curricular_offering_competency_map;

-- (선택) 인덱스명도 정리하고 싶으면
ALTER INDEX idx_eccm_competency_id
RENAME TO idx_ecocm_competency_id;
