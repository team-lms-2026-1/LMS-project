-- ============================================
-- 1. 학습공간/대여 관련 권한 (Permission) 정의
-- ============================================
INSERT INTO auth_permission (code, description, created_at, updated_at)
VALUES
  -- 학습공간(Space) 관련
  ('SPACE_READ',    '학습공간 조회', now(), now()),
  ('SPACE_MANAGE',  '학습공간 관리(생성/수정/삭제)', now(), now()),
  
  -- 대여(Rental) 관련
  ('RENTAL_READ',   '대여 내역 조회', now(), now()),
  ('RENTAL_CREATE', '대여 신청', now(), now()),
  ('RENTAL_MANAGE', '대여 관리(승인/반려)', now(), now())
ON CONFLICT (code) DO NOTHING;

-- ================================================================
-- 2. 역할 - 권한 매핑 (Role-Permission Mapping) 
-- ================================================================

-- 2-1) STUDENT_BASIC: 학습공간 조회 + 대여 신청 + 내역 조회
INSERT INTO auth_role_permission (role_id, permission_id, created_at, created_by)
SELECT r.role_id, p.permission_id, now(), 1
FROM auth_role r
JOIN auth_permission p ON p.code IN (
    'SPACE_READ',   -- 공간 목록/상세 조회
    'RENTAL_READ',  -- 내 예약 내역 조회
    'RENTAL_CREATE' -- 예약 신청
)
WHERE r.code = 'STUDENT_BASIC'
ON CONFLICT DO NOTHING;

-- 2-2) PROFESSOR_BASIC: 학습공간 조회 (필요시 대여 권한 추가 가능)
INSERT INTO auth_role_permission (role_id, permission_id, created_at, created_by)
SELECT r.role_id, p.permission_id, now(), 1
FROM auth_role r
JOIN auth_permission p ON p.code IN (
    'SPACE_READ',
    'RENTAL_READ'
)
WHERE r.code = 'PROFESSOR_BASIC'
ON CONFLICT DO NOTHING;

-- 2-3) ADMIN_SYSTEM: 모든 권한 (공간 관리 + 대여 승인/반려)
INSERT INTO auth_role_permission (role_id, permission_id, created_at, created_by)
SELECT r.role_id, p.permission_id, now(), 1
FROM auth_role r
JOIN auth_permission p ON p.code IN (
    'SPACE_READ', 'SPACE_MANAGE',   -- 공간 생성, 수정, 삭제
    'RENTAL_READ', 'RENTAL_MANAGE', -- 예약 전체 조회, 승인, 반려
    'RENTAL_CREATE'                 -- 관리자도 테스트용 신청 가능
)
WHERE r.code = 'ADMIN_SYSTEM'
ON CONFLICT DO NOTHING;



-- ================================================================
-- 3. 시드 데이터 
-- ================================================================
-- =======================================================
-- 1. Study Space (스터디 공간) 데이터
-- =======================================================
INSERT INTO study_space 
(space_id, space_name, location, description, is_active, created_by, updated_by, created_at, updated_at)
VALUES
(1, '중앙도서관 창의열람실', '중앙도서관 4층', '조용하고 집중하기 좋은 개인 및 그룹 학습 공간입니다.', TRUE, 1, 1, now(), now()),
(2, '제2공학관 스터디라운지', '제2공학관 1층 로비', '자유로운 분위기에서 토론이 가능한 오픈형 라운지입니다.', TRUE, 1, 1, now(), now()),
(3, '인문관 세미나실', '인문관 302호', '소규모 세미나 및 발표 연습에 최적화된 공간입니다.', TRUE, 1, 1, now(), now());

-- 시퀀스 동기화 (ID 충돌 방지)
SELECT setval('study_space_space_id_seq', (SELECT MAX(space_id) FROM study_space));


-- =======================================================
-- 2. Study Space Image (공간 이미지) 데이터
-- =======================================================
INSERT INTO study_space_image (space_id, image_url, sort_order)
VALUES
-- 중앙도서관 이미지
(1, '이미지 주소 (S3)', 1),
(1, '이미지 주소 (S3)', 2),
-- 공학관 이미지
(2, '이미지 주소 (S3)', 1),
-- 인문관 이미지
(3, '이미지 주소 (S3)', 1);


-- =======================================================
-- 3. Study Space Rule (이용 규칙) 데이터
-- =======================================================
INSERT INTO study_space_rule (space_id, content, sort_order, created_by, created_at)
VALUES
-- 중앙도서관 규칙
(1, '음식물 반입을 금지합니다 (음료 제외).', 1, 1, now()),
(1, '대화는 소곤소곤 해주세요.', 2, 1, now()),
(1, '사용 후 자리를 정리해주세요.', 3, 1, now()),
-- 공학관 규칙
(2, '자유로운 토론이 가능합니다.', 1, 1, now()),
(2, '배달 음식 섭취는 불가능합니다.', 2, 1, now());


-- =======================================================
-- 4. Study Room (스터디 룸 - 상세 룸) 데이터
-- =======================================================
INSERT INTO study_room 
(room_id, space_id, room_name, min_people, max_people, description, operation_start_date, operation_end_date, rentable_start_time, rentable_end_time, is_active, created_by, updated_by)
VALUES
-- Space 1: 중앙도서관 (09:00 ~ 22:00)
(1, 1, '그룹스터디룸 A', 3, 6, '화이트보드와 모니터가 구비된 6인실', '2026-01-01', '2026-12-31', '09:00:00', '22:00:00', TRUE, 1, 1),
(2, 1, '그룹스터디룸 B', 3, 6, '창가 쪽에 위치한 쾌적한 6인실', '2026-01-01', '2026-12-31', '09:00:00', '22:00:00', TRUE, 1, 1),
(3, 1, '대형 회의실', 6, 10, '빔프로젝터가 있는 대형 회의실', '2026-01-01', '2026-12-31', '09:00:00', '22:00:00', TRUE, 1, 1),

-- Space 2: 공학관 (24시간 운영이나 예약은 10:00 ~ 20:00 제한 예시)
(4, 2, '오픈 테이블 1', 2, 4, '라운지 중앙 오픈 테이블', '2026-01-01', '2026-12-31', '10:00:00', '20:00:00', TRUE, 1, 1),
(5, 2, '오픈 테이블 2', 2, 4, '라운지 안쪽 조용한 테이블', '2026-01-01', '2026-12-31', '10:00:00', '20:00:00', TRUE, 1, 1),

-- Space 3: 인문관 (공사중 등으로 비활성화 예시)
(6, 3, '세미나실 301호', 4, 8, '현재 내부 수리중입니다.', '2026-01-01', '2026-06-30', '09:00:00', '18:00:00', FALSE, 1, 1);

-- 시퀀스 동기화
SELECT setval('study_room_room_id_seq', (SELECT MAX(room_id) FROM study_room));


-- =======================================================
-- 5. Study Room Rental (예약 내역) 데이터
-- =======================================================
-- 날짜는 쿼리 실행 시점(now) 기준으로 미래/과거를 설정했습니다.

INSERT INTO study_room_rental 
(rental_id, room_id, applicant_account_id, start_at, end_at, status, applied_at, processed_by, processed_at, rejection_reason)
VALUES
-- 1. [승인됨] 학생1이 룸A 예약 (미래)
(1, 1, 2, 
 CURRENT_DATE + INTERVAL '1 day' + TIME '14:00:00', 
 CURRENT_DATE + INTERVAL '1 day' + TIME '16:00:00', 
 'APPROVED', now(), 1, now(), NULL),

-- 2. [신청중] 학생2가 룸A 예약 신청 (미래 - 위 시간과 겹치지 않음)
(2, 1, 3, 
 CURRENT_DATE + INTERVAL '1 day' + TIME '16:00:00', 
 CURRENT_DATE + INTERVAL '1 day' + TIME '18:00:00', 
 'REQUESTED', now(), NULL, NULL, NULL),

-- 3. [반려됨] 학생1이 룸B 예약 신청했으나 반려됨
(3, 2, 2, 
 CURRENT_DATE + INTERVAL '2 day' + TIME '10:00:00', 
 CURRENT_DATE + INTERVAL '2 day' + TIME '12:00:00', 
 'REJECTED', now(), 1, now(), '해당 시간에 시설 점검이 있습니다.'),

-- 4. [취소됨] 학생2가 공학관 예약했다가 취소함
(4, 4, 3, 
 CURRENT_DATE + INTERVAL '3 day' + TIME '13:00:00', 
 CURRENT_DATE + INTERVAL '3 day' + TIME '15:00:00', 
 'CANCELED', now(), NULL, NULL, NULL);

-- 시퀀스 동기화
SELECT setval('study_room_rental_rental_id_seq', (SELECT MAX(rental_id) FROM study_room_rental));
