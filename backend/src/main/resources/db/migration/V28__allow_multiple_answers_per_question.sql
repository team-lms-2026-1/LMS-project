-- 멘토 답변의 중복 제한 해제 (교수가 한 질문에 여러 번 답할 수 있도록 함)
ALTER TABLE mentoring_answer DROP CONSTRAINT uq_mentoring_ans_question;
-- 멘토링 신청사유 컬럼 추가
ALTER TABLE mentoring_application ADD COLUMN apply_reason TEXT;

