-- -- 학생 교수 권한 이랑 커뮤니티 시드 테스트 

-- ==========================================
-- 1. 학생 (Student) 생성 생성 비밀번호 abc12345
-- ==========================================
-- 1-1. 학생 계정
INSERT INTO account (login_id, password_hash, account_type, status, created_at, updated_at)
VALUES ('s20240001', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'STUDENT', 'ACTIVE', now(), now())
ON CONFLICT (login_id) DO NOTHING;

-- 1-2. 학생 프로필
INSERT INTO student_profile (
    account_id, student_no, name, email, phone, grade_level, academic_status, dept_id, created_at, updated_at
)
SELECT 
    a.account_id, '20240001', '김학생', 'student@example.com', '010-1111-2222', 1, 'ENROLLED',
    (SELECT dept_id FROM dept WHERE dept_code = 'CS'),
    now(), now()
FROM account a WHERE a.login_id = 's20240001'
ON CONFLICT (account_id) DO NOTHING;


-- ==========================================
-- 2. 교수 (Professor) 생성 생성 비밀번호 abc12345
-- ==========================================
-- 2-1. 교수 계정
INSERT INTO account (login_id, password_hash, account_type, status, created_at, updated_at)
VALUES ('p19990001', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'PROFESSOR', 'ACTIVE', now(), now())
ON CONFLICT (login_id) DO NOTHING;

-- 2-2. 교수 프로필
INSERT INTO professor_profile (
    account_id, professor_no, name, email, phone, dept_id, created_at, updated_at
)
SELECT 
    a.account_id, '19990001', '박교수', 'prof@example.com', '010-3333-4444',
    (SELECT dept_id FROM dept WHERE dept_code = 'CS'),
    now(), now()
FROM account a WHERE a.login_id = 'p19990001'
ON CONFLICT (account_id) DO NOTHING;


-- ==========================================
-- 3. 관리자 (Admin) 생성 (테스트용 추가)
-- ==========================================
-- INSERT INTO account (login_id, password_hash, account_type, status, created_at, updated_at)
-- VALUES ('admin', '$2y$10$YJVZBHL0jVtXGH2Z40cq/uIfL.XikFxfYYREhGjrmqdm2LQIg4nm.', 'ADMIN', 'ACTIVE', now(), now())
-- ON CONFLICT (login_id) DO NOTHING;


-- ============================================
-- 4. 권한 (Permission) 정의
-- ============================================
INSERT INTO auth_permission (code, description, created_at, updated_at)
VALUES
  ('NOTICE_READ',    '공지사항 조회', now(), now()),
  ('NOTICE_MANAGE',  '공지사항 관리', now(), now()),
  ('RESOURCE_READ',    '자료실 조회', now(), now()),
  ('RESOURCE_MANAGE',  '자료실 관리', now(), now()),
  ('FAQ_READ',    'FAQ 조회', now(), now()),
  ('FAQ_MANAGE',  'FAQ 관리', now(), now()),
  ('QNA_READ',    'Q&A 조회', now(), now()),
  ('QNA_MANAGE',  'Q&A 관리', now(), now()),
  ('QNA_CREATE', 'Q&A 질문 등록', now(), now()),
  ('QNA_DELETE', 'Q&A 질문 삭제', now(), now()),
  ('QNA_CHANGE', 'Q&A 질문 수정', now(), now())
ON CONFLICT (code) DO NOTHING;


-- =====================================================
-- 5. 역할 (Role) 정의
-- =====================================================
INSERT INTO auth_role (code, description, role_scope, is_active, created_at, updated_at)
VALUES
  ('STUDENT_BASIC',   '학생 기본 역할',   'STUDENT', true, now(), now()),
  ('PROFESSOR_BASIC', '교수 기본 역할',   'PROFESSOR', true, now(), now()),
  ('ADMIN_SYSTEM',    '시스템 관리자',    'ADMIN', true, now(), now())
ON CONFLICT (code) DO NOTHING;


-- ================================================================
-- 6. 역할 - 권한 매핑 (Role-Permission Mapping)
-- ================================================================

-- 6-1) STUDENT_BASIC: 조회 + QnA 작성/삭제
INSERT INTO auth_role_permission (role_id, permission_id, created_at, created_by)
SELECT r.role_id, p.permission_id, now(), 1
FROM auth_role r
JOIN auth_permission p ON p.code IN (
    'NOTICE_READ', 'RESOURCE_READ', 'FAQ_READ', 'QNA_READ', 
    'QNA_CREATE', 'QNA_DELETE', 'QNA_CHANGE'
)
WHERE r.code = 'STUDENT_BASIC'
ON CONFLICT DO NOTHING;

-- 6-2) PROFESSOR_BASIC: 조회 전체
INSERT INTO auth_role_permission (role_id, permission_id, created_at, created_by)
SELECT r.role_id, p.permission_id, now(), 1
FROM auth_role r
JOIN auth_permission p ON p.code IN (
    'NOTICE_READ', 'RESOURCE_READ', 'FAQ_READ', 'QNA_READ'
)
WHERE r.code = 'PROFESSOR_BASIC'
ON CONFLICT DO NOTHING;

-- 6-3) ADMIN_SYSTEM: 모든 권한 (READ + MANAGE)
INSERT INTO auth_role_permission (role_id, permission_id, created_at, created_by)
SELECT r.role_id, p.permission_id, now(), 1
FROM auth_role r
JOIN auth_permission p ON p.code IN (
    'NOTICE_READ', 'NOTICE_MANAGE',
    'RESOURCE_READ', 'RESOURCE_MANAGE',
    'FAQ_READ', 'FAQ_MANAGE',
    'QNA_READ', 'QNA_MANAGE',
    'QNA_CREATE', 'QNA_DELETE'
)
WHERE r.code = 'ADMIN_SYSTEM'
ON CONFLICT DO NOTHING;

-- ==========================================================
-- 7. [수정됨] 계정 - 역할 매핑 (Account-Role Mapping)
-- ON CONFLICT 에러 해결을 위해 WHERE NOT EXISTS 방식으로 변경
-- ==========================================================

-- 7-1. 김학생(s20240001) -> STUDENT_BASIC 연결
INSERT INTO auth_account_role (account_id, role_id, assigned_at, assigned_by)
SELECT a.account_id, r.role_id, now(), 1
FROM account a, auth_role r
WHERE a.login_id = 's20240001' AND r.code = 'STUDENT_BASIC'
AND NOT EXISTS (
    SELECT 1 FROM auth_account_role aar 
    WHERE aar.account_id = a.account_id AND aar.role_id = r.role_id
);

-- 7-2. 박교수(p19990001) -> PROFESSOR_BASIC 연결
INSERT INTO auth_account_role (account_id, role_id, assigned_at, assigned_by)
SELECT a.account_id, r.role_id, now(), 1
FROM account a, auth_role r
WHERE a.login_id = 'p19990001' AND r.code = 'PROFESSOR_BASIC'
AND NOT EXISTS (
    SELECT 1 FROM auth_account_role aar 
    WHERE aar.account_id = a.account_id AND aar.role_id = r.role_id
);

-- 7-3. 관리자(admin) -> ADMIN_SYSTEM 연결
INSERT INTO auth_account_role (account_id, role_id, assigned_at, assigned_by)
SELECT a.account_id, r.role_id, now(), 1
FROM account a, auth_role r
WHERE a.login_id = 'admin' AND r.code = 'ADMIN_SYSTEM'
AND NOT EXISTS (
    SELECT 1 FROM auth_account_role aar 
    WHERE aar.account_id = a.account_id AND aar.role_id = r.role_id
);

-- 커뮤니티 데이터 시드
-- -- =========================================================
-- -- 1. 공지사항 (Notice) 데이터 시드
-- -- 작성자: 관리자 (a20001122)
-- -- =========================================================

-- -- ---------------------------------------------------------
-- -- 1-1. 공지사항 카테고리 생성 (Notice Category)
-- -- ---------------------------------------------------------

-- -- 1) '학사' 카테고리
-- INSERT INTO notice_category (name, bg_color_hex, text_color_hex, created_by, updated_by)
-- SELECT 
--     '학사',      -- 카테고리명
--     '#EEF2FF',   -- 배경색 (연한 파랑)
--     '#1E3A8A',   -- 글자색 (진한 파랑)
--     a.account_id, 
--     a.account_id
-- FROM account a WHERE a.login_id = 'a20001122'
-- ON CONFLICT (name) DO NOTHING;

-- -- 2) '장학' 카테고리
-- INSERT INTO notice_category (name, bg_color_hex, text_color_hex, created_by, updated_by)
-- SELECT 
--     '장학', 
--     '#FFF7ED',   -- 배경색 (연한 주황)
--     '#9A3412',   -- 글자색 (진한 주황)
--     a.account_id, 
--     a.account_id
-- FROM account a WHERE a.login_id = 'a20001122'
-- ON CONFLICT (name) DO NOTHING;

-- -- 3) '시스템' 카테고리
-- INSERT INTO notice_category (name, bg_color_hex, text_color_hex, created_by, updated_by)
-- SELECT 
--     '시스템', 
--     '#FEE2E2',   -- 배경색 (연한 빨강 - 중요)
--     '#991B1B',   -- 글자색 (진한 빨강)
--     a.account_id, 
--     a.account_id
-- FROM account a WHERE a.login_id = 'a20001122'
-- ON CONFLICT (name) DO NOTHING;


-- -- ---------------------------------------------------------
-- -- 1-2. 공지사항 본문 생성 (Notice)
-- -- ---------------------------------------------------------

-- -- 1) 학사 공지: 수강신청 안내
-- INSERT INTO notice (
--     category_id, 
--     title, 
--     content, 
--     display_start_at, 
--     display_end_at, 
--     view_count, 
--     author_account_id, 
--     created_by, 
--     updated_by
-- )
-- SELECT 
--     (SELECT category_id FROM notice_category WHERE name = '학사'), -- '학사' 카테고리 ID 자동 조회
--     '2024학년도 1학기 수강신청 안내', 
--     '<p>2024학년도 1학기 수강신청 일정입니다. <b>반드시 기간을 엄수해주세요.</b></p><p>기간: 2월 13일 ~ 2월 17일</p>', 
--     now(), -- 게시 시작: 현재
--     NULL,  -- 게시 종료: 없음 (계속 게시)
--     150,   -- 조회수 (임의)
--     a.account_id, -- 작성자 (관리자)
--     a.account_id, -- created_by
--     a.account_id  -- updated_by
-- FROM account a WHERE a.login_id = 'a20001122';

-- -- 2) 시스템 공지: 서버 점검 (기간 설정 예시)
-- INSERT INTO notice (
--     category_id, 
--     title, 
--     content, 
--     display_start_at, 
--     display_end_at, 
--     view_count, 
--     author_account_id, 
--     created_by, 
--     updated_by
-- )
-- SELECT 
--     (SELECT category_id FROM notice_category WHERE name = '시스템'),
--     'LMS 서버 정기 점검 안내 (02:00 ~ 04:00)', 
--     '<p>안정적인 서비스 제공을 위해 새벽 시간대 서버 점검이 진행됩니다. 이용에 불편을 드려 죄송합니다.</p>', 
--     now(), 
--     now() + INTERVAL '7 days', -- 7일 뒤까지만 게시됨
--     45, 
--     a.account_id, 
--     a.account_id, 
--     a.account_id
-- FROM account a WHERE a.login_id = 'a20001122';


-- -- ---------------------------------------------------------
-- -- 1-3. 공지사항 첨부파일 생성 (Notice Attachment)
-- -- ---------------------------------------------------------

-- -- 위에서 등록한 '수강신청 안내' 공지에 PDF 파일 첨부
-- INSERT INTO notice_attachment (
--     notice_id, 
--     storage_key, 
--     original_name, 
--     content_type, 
--     file_size, 
--     uploaded_by, 
--     updated_by
-- )
-- SELECT 
--     (SELECT notice_id FROM notice WHERE title = '2024학년도 1학기 수강신청 안내' LIMIT 1), -- 해당 공지글 ID 찾기
--     'notices/2024/02/course_manual_v1.pdf',  -- S3 저장 키 (가상)
--     '2024_1학기_수강신청_매뉴얼.pdf',          -- 원본 파일명
--     'application/pdf',                       -- 파일 타입
--     2048576,                                 -- 파일 크기 (2MB)
--     a.account_id, 
--     a.account_id
-- FROM account a WHERE a.login_id = 'a20001122';


-- -- =========================================================
-- -- 2. 자료실 (Resource) 데이터 시드
-- -- 작성자: 관리자 (a20001122)
-- -- =========================================================

-- -- ---------------------------------------------------------
-- -- 2-1. 자료실 카테고리 생성 (Resource Category)
-- -- ---------------------------------------------------------

-- -- 1) '양식' 카테고리 (신청서 등)
-- INSERT INTO resource_category (name, bg_color_hex, text_color_hex, created_by, updated_by)
-- SELECT 
--     '양식',      -- 카테고리명
--     '#F0FDF4',   -- 배경색 (연한 초록)
--     '#166534',   -- 글자색 (진한 초록)
--     a.account_id, 
--     a.account_id
-- FROM account a WHERE a.login_id = 'a20001122'
-- ON CONFLICT (name) DO NOTHING;

-- -- 2) '강의자료' 카테고리 (수업 자료)
-- INSERT INTO resource_category (name, bg_color_hex, text_color_hex, created_by, updated_by)
-- SELECT 
--     '강의자료', 
--     '#F0F9FF',   -- 배경색 (연한 하늘)
--     '#0C4A6E',   -- 글자색 (진한 하늘)
--     a.account_id, 
--     a.account_id
-- FROM account a WHERE a.login_id = 'a20001122'
-- ON CONFLICT (name) DO NOTHING;

-- -- 3) '규정' 카테고리 (학칙 등)
-- INSERT INTO resource_category (name, bg_color_hex, text_color_hex, created_by, updated_by)
-- SELECT 
--     '규정', 
--     '#F3F4F6',   -- 배경색 (회색)
--     '#1F2937',   -- 글자색 (진한 회색)
--     a.account_id, 
--     a.account_id
-- FROM account a WHERE a.login_id = 'a20001122'
-- ON CONFLICT (name) DO NOTHING;


-- -- ---------------------------------------------------------
-- -- 2-2. 자료실 게시글 생성 (Resource Post)
-- -- ---------------------------------------------------------

-- -- 1) 양식: 휴학 신청서
-- INSERT INTO resource_post (
--     category_id, 
--     title, 
--     content, 
--     view_count, 
--     author_account_id, 
--     created_by, 
--     updated_by
-- )
-- SELECT 
--     (SELECT category_id FROM resource_category WHERE name = '양식'), -- '양식' 카테고리 ID
--     '2024학년도 휴학/복학 신청서 양식', 
--     '<p>휴학 및 복학 신청 시 사용하는 공식 서식입니다. 작성 후 학과 사무실로 제출 바랍니다.</p>', 
--     85,   -- 조회수
--     a.account_id, 
--     a.account_id, 
--     a.account_id
-- FROM account a WHERE a.login_id = 'a20001122';

-- -- 2) 강의자료: 자바 프로그래밍 강의계획서
-- INSERT INTO resource_post (
--     category_id, 
--     title, 
--     content, 
--     view_count, 
--     author_account_id, 
--     created_by, 
--     updated_by
-- )
-- SELECT 
--     (SELECT category_id FROM resource_category WHERE name = '강의자료'),
--     '[공통] 객체지향 프로그래밍 강의계획서', 
--     '<p>이번 학기 객체지향 프로그래밍(Java) 수업 강의계획서입니다. 교재 및 평가 방법을 확인하세요.</p>', 
--     120, 
--     a.account_id, 
--     a.account_id, 
--     a.account_id
-- FROM account a WHERE a.login_id = 'a20001122';


-- -- ---------------------------------------------------------
-- -- 2-3. 자료실 첨부파일 생성 (Resource Attachment)
-- -- ---------------------------------------------------------

-- -- 1) 휴학 신청서 파일 첨부 (.docx)
-- INSERT INTO resource_attachment (
--     resource_id, 
--     storage_key, 
--     original_name, 
--     content_type, 
--     file_size, 
--     uploaded_by, 
--     updated_by
-- )
-- SELECT 
--     (SELECT resource_id FROM resource_post WHERE title = '2024학년도 휴학/복학 신청서 양식' LIMIT 1),
--     'resources/forms/leave_application_v2.docx', -- 가상의 S3 경로
--     '휴학복학신청서_v2.docx',                     -- 원본 파일명
--     'application/vnd.openxmlformats-officedocument.wordprocessingml.document', -- Word MIME type
--     15400,                                       -- 15KB
--     a.account_id, 
--     a.account_id
-- FROM account a WHERE a.login_id = 'a20001122';

-- -- 2) 강의계획서 파일 첨부 (.pdf)
-- INSERT INTO resource_attachment (
--     resource_id, 
--     storage_key, 
--     original_name, 
--     content_type, 
--     file_size, 
--     uploaded_by, 
--     updated_by
-- )
-- SELECT 
--     (SELECT resource_id FROM resource_post WHERE title = '[공통] 객체지향 프로그래밍 강의계획서' LIMIT 1),
--     'resources/syllabus/java_oop_syllabus.pdf',  -- 가상의 S3 경로
--     '강의계획서_Java.pdf',                        -- 원본 파일명
--     'application/pdf',                           -- PDF MIME type
--     512000,                                      -- 500KB
--     a.account_id, 
--     a.account_id
-- FROM account a WHERE a.login_id = 'a20001122';



-- -- =========================================================
-- -- 3. FAQ (자주 묻는 질문) 데이터 시드
-- -- 작성자: 관리자 (a20001122)
-- -- =========================================================

-- -- ---------------------------------------------------------
-- -- 3-1. FAQ 카테고리 생성 (FAQ Category)
-- -- ---------------------------------------------------------

-- -- 1) '등록/장학' 카테고리
-- INSERT INTO faq_category (name, bg_color_hex, text_color_hex, created_by, updated_by)
-- SELECT 
--     '등록/장학',   -- 카테고리명
--     '#FFF1F2',   -- 배경색 (연한 핑크)
--     '#BE123C',   -- 글자색 (진한 핑크)
--     a.account_id, 
--     a.account_id
-- FROM account a WHERE a.login_id = 'a20001122'
-- ON CONFLICT (name) DO NOTHING;

-- -- 2) '학사/수업' 카테고리
-- INSERT INTO faq_category (name, bg_color_hex, text_color_hex, created_by, updated_by)
-- SELECT 
--     '학사/수업', 
--     '#F0F9FF',   -- 배경색 (연한 하늘)
--     '#0369A1',   -- 글자색 (진한 하늘)
--     a.account_id, 
--     a.account_id
-- FROM account a WHERE a.login_id = 'a20001122'
-- ON CONFLICT (name) DO NOTHING;

-- -- 3) '시스템/계정' 카테고리
-- INSERT INTO faq_category (name, bg_color_hex, text_color_hex, created_by, updated_by)
-- SELECT 
--     '시스템/계정', 
--     '#F3F4F6',   -- 배경색 (회색)
--     '#374151',   -- 글자색 (진한 회색)
--     a.account_id, 
--     a.account_id
-- FROM account a WHERE a.login_id = 'a20001122'
-- ON CONFLICT (name) DO NOTHING;


-- -- ---------------------------------------------------------
-- -- 3-2. FAQ 본문 생성 (FAQ)
-- -- ---------------------------------------------------------

-- -- 1) [등록/장학] 국가장학금 질문
-- INSERT INTO faq (
--     category_id, 
--     title, 
--     content, 
--     view_count, 
--     author_account_id, 
--     created_by, 
--     updated_by
-- )
-- SELECT 
--     (SELECT category_id FROM faq_category WHERE name = '등록/장학'), -- 카테고리 ID 자동 조회
--     '국가장학금 신청 기간은 언제인가요?', 
--     '<p>국가장학금은 한국장학재단 일정에 따라 매 학기 방학 중에 1차 신청이 진행됩니다.</p><p>정확한 일정은 한국장학재단 홈페이지를 참고해주세요.</p>', 
--     999, -- 높은 조회수 (자주 묻는 질문이니까)
--     a.account_id, 
--     a.account_id, 
--     a.account_id
-- FROM account a WHERE a.login_id = 'a20001122';

-- -- 2) [등록/장학] 등록금 분납 질문
-- INSERT INTO faq (
--     category_id, title, content, view_count, author_account_id, created_by, updated_by
-- )
-- SELECT 
--     (SELECT category_id FROM faq_category WHERE name = '등록/장학'),
--     '등록금 분납 신청은 어떻게 하나요?', 
--     '<p>등록금 분납은 [학사정보 시스템 > 등록 > 분납신청] 메뉴에서 신청 가능합니다.</p><p>최대 4회까지 분납 가능하며, 1차 납부 기간 내에 납부하지 않으면 취소됩니다.</p>', 
--     540,
--     a.account_id, a.account_id, a.account_id
-- FROM account a WHERE a.login_id = 'a20001122';

-- -- 3) [학사/수업] 휴학 신청 질문
-- INSERT INTO faq (
--     category_id, title, content, view_count, author_account_id, created_by, updated_by
-- )
-- SELECT 
--     (SELECT category_id FROM faq_category WHERE name = '학사/수업'),
--     '휴학 신청은 언제부터 가능한가요?', 
--     '<p>일반 휴학은 개강 전 소정의 기간에 신청 가능하며, 질병 휴학은 진단서 첨부 시 상시 가능합니다.</p>', 
--     720,
--     a.account_id, a.account_id, a.account_id
-- FROM account a WHERE a.login_id = 'a20001122';

-- -- 4) [시스템/계정] 비밀번호 재설정 질문
-- INSERT INTO faq (
--     category_id, title, content, view_count, author_account_id, created_by, updated_by
-- )
-- SELECT 
--     (SELECT category_id FROM faq_category WHERE name = '시스템/계정'),
--     '로그인 비밀번호를 잊어버렸습니다.', 
--     '<p>로그인 화면 하단의 [비밀번호 찾기] 버튼을 눌러 본인 인증 후 재설정하실 수 있습니다.</p>', 
--     300,
--     a.account_id, a.account_id, a.account_id
-- FROM account a WHERE a.login_id = 'a20001122';


-- -- =========================================================
-- -- 4. QnA (묻고 답하기) 데이터 시드
-- -- 작성자: 관리자(카테고리/답변), 학생(질문)
-- -- =========================================================

-- -- ---------------------------------------------------------
-- -- 4-1. QnA 카테고리 생성 (QnA Category)
-- -- 작성자: 관리자 (a20001122)
-- -- ---------------------------------------------------------

-- -- 1) '학사문의' 카테고리
-- INSERT INTO qna_category (name, bg_color_hex, text_color_hex, created_by, updated_by)
-- SELECT 
--     '학사문의', 
--     '#EEF2FF', 
--     '#1E3A8A', -- 파랑 계열
--     a.account_id, a.account_id
-- FROM account a WHERE a.login_id = 'a20001122'
-- ON CONFLICT (name) DO NOTHING;

-- -- 2) '장학/등록' 카테고리
-- INSERT INTO qna_category (name, bg_color_hex, text_color_hex, created_by, updated_by)
-- SELECT 
--     '장학/등록', 
--     '#FFF7ED',
--     '#9A3412', -- 주황 계열
--     a.account_id, a.account_id
-- FROM account a WHERE a.login_id = 'a20001122'
-- ON CONFLICT (name) DO NOTHING;

-- -- 3) '기타문의' 카테고리
-- INSERT INTO qna_category (name, bg_color_hex, text_color_hex, created_by, updated_by)
-- SELECT 
--     '기타문의', 
--     '#F3F4F6', 
--     '#374151', -- 회색 계열
--     a.account_id, a.account_id
-- FROM account a WHERE a.login_id = 'a20001122'
-- ON CONFLICT (name) DO NOTHING;

-- -- 1) 질문: 졸업 요건 (학사문의)
-- INSERT INTO qna_question (
--     category_id, title, content, view_count, 
--     author_account_id, created_by, updated_by
-- )
-- SELECT 
--     (SELECT category_id FROM qna_category WHERE name = '학사문의'), -- 카테고리 ID
--     '졸업 논문 대체 자격증 관련 문의드립니다.', -- 제목
--     '<p>정보처리기사 자격증 취득 시 졸업 논문이 면제되는지 궁금합니다. 가능하다면 제출 기한은 언제까지인가요?</p>', -- 내용
--     12, -- 조회수
--     s.account_id, -- 작성자 (학생 ID)
--     s.account_id, -- created_by (학생)
--     s.account_id  -- updated_by (학생)
-- FROM account s WHERE s.login_id = 's20240001'; -- ★ 학생 계정 사용

-- -- 2) 질문: 장학금 신청 (장학/등록) -> 이 질문은 답변 없이 남겨둠 (답변 대기중 테스트용)
-- INSERT INTO qna_question (
--     category_id, title, content, view_count, 
--     author_account_id, created_by, updated_by
-- )
-- SELECT 
--     (SELECT category_id FROM qna_category WHERE name = '장학/등록'),
--     '성적 우수 장학금 기준 문의',
--     '<p>지난 학기 평점 4.0인데 성적 장학금 대상이 되는지 확인 부탁드립니다.</p>',
--     5,
--     s.account_id, s.account_id, s.account_id
-- FROM account s WHERE s.login_id = 's20240001';

-- -- 3) 질문: 비밀번호 변경 (기타문의)
-- INSERT INTO qna_question (
--     category_id, title, content, view_count, 
--     author_account_id, created_by, updated_by
-- )
-- SELECT 
--     (SELECT category_id FROM qna_category WHERE name = '기타문의'),
--     '비밀번호 변경이 안 됩니다.',
--     '<p>마이페이지에서 비밀번호 변경 시 오류가 발생합니다. 확인 부탁드립니다.</p>',
--     8,
--     s.account_id, s.account_id, s.account_id
-- FROM account s WHERE s.login_id = 's20240001';


-- -- ---------------------------------------------------------
-- -- 4-3. QnA 답변 등록 (QnA Answer)
-- -- 작성자: 관리자 (a20001122)
-- -- ---------------------------------------------------------

-- -- 1) 답변: 졸업 요건 질문에 대한 답변
-- INSERT INTO qna_answer (
--     question_id, content, 
--     author_account_id, created_by, updated_by
-- )
-- SELECT 
--     (SELECT question_id FROM qna_question WHERE title = '졸업 논문 대체 자격증 관련 문의드립니다.' LIMIT 1), -- 질문 ID 찾기
--     '<p>네, 안녕하세요. 학과 사무실입니다.<br>정보처리기사 자격증 원본을 지참하여 학과 사무실로 방문해주시면 졸업 논문 대체 인정 신청이 가능합니다.<br>제출 기한은 11월 30일까지입니다.</p>',
--     a.account_id, -- 답변자 (관리자 ID)
--     a.account_id, -- created_by (관리자)
--     a.account_id  -- updated_by (관리자)
-- FROM account a WHERE a.login_id = 'a20001122'; -- ★ 관리자 계정 사용

-- -- 2) 답변: 비밀번호 변경 질문에 대한 답변
-- INSERT INTO qna_answer (
--     question_id, content, 
--     author_account_id, created_by, updated_by
-- )
-- SELECT 
--     (SELECT question_id FROM qna_question WHERE title = '비밀번호 변경이 안 됩니다.' LIMIT 1),
--     '<p>불편을 드려 죄송합니다.<br>현재 시스템 점검 중으로 일시적인 오류가 발생했을 수 있습니다.<br>잠시 후 다시 시도해 보시고, 동일한 증상이 계속되면 전산실(02-123-4567)로 연락 바랍니다.</p>',
--     a.account_id, 
--     a.account_id, 
--     a.account_id
-- FROM account a WHERE a.login_id = 'a20001122';

