-- =======================================================
-- MBTI Seed Data (20 Questions with 5-point Likert Scale)
-- =======================================================

-- Clear existing data if any (optional, but good for re-run dev env)
-- TRUNCATE TABLE mbti_choice, mbti_question RESTART IDENTITY CASCADE;

-- Q1. EI
INSERT INTO mbti_question (content, dimension, sort_order) VALUES ('힘든 하루를 보낸 후에는 혼자 쉬기보다 친구들을 만나 수다를 떨어야 스트레스가 풀린다.', 'EI', 1);
INSERT INTO mbti_choice (question_id, content, score_a, score_b) VALUES 
(currval('mbti_question_question_id_seq'), '매우 그렇다', 20, 0),
(currval('mbti_question_question_id_seq'), '그렇다', 15, 5),
(currval('mbti_question_question_id_seq'), '보통이다', 10, 10),
(currval('mbti_question_question_id_seq'), '아니다', 5, 15),
(currval('mbti_question_question_id_seq'), '매우 아니다', 0, 20);

-- Q2. EI
INSERT INTO mbti_question (content, dimension, sort_order) VALUES ('새로운 모임이나 낯선 장소에서도 어색함 없이 처음 보는 사람에게 먼저 말을 건네는 편이다.', 'EI', 2);
INSERT INTO mbti_choice (question_id, content, score_a, score_b) VALUES 
(currval('mbti_question_question_id_seq'), '매우 그렇다', 20, 0),
(currval('mbti_question_question_id_seq'), '그렇다', 15, 5),
(currval('mbti_question_question_id_seq'), '보통이다', 10, 10),
(currval('mbti_question_question_id_seq'), '아니다', 5, 15),
(currval('mbti_question_question_id_seq'), '매우 아니다', 0, 20);

-- Q3. EI
INSERT INTO mbti_question (content, dimension, sort_order) VALUES ('생각을 머릿속으로 혼자 정리하기보다는, 일단 말로 내뱉으면서 정리하는 것을 선호한다.', 'EI', 3);
INSERT INTO mbti_choice (question_id, content, score_a, score_b) VALUES 
(currval('mbti_question_question_id_seq'), '매우 그렇다', 20, 0),
(currval('mbti_question_question_id_seq'), '그렇다', 15, 5),
(currval('mbti_question_question_id_seq'), '보통이다', 10, 10),
(currval('mbti_question_question_id_seq'), '아니다', 5, 15),
(currval('mbti_question_question_id_seq'), '매우 아니다', 0, 20);

-- Q4. EI
INSERT INTO mbti_question (content, dimension, sort_order) VALUES ('주말이나 휴일에 집에만 있으면 답답함을 느끼고, 밖으로 나가 활동하고 싶어 한다.', 'EI', 4);
INSERT INTO mbti_choice (question_id, content, score_a, score_b) VALUES 
(currval('mbti_question_question_id_seq'), '매우 그렇다', 20, 0),
(currval('mbti_question_question_id_seq'), '그렇다', 15, 5),
(currval('mbti_question_question_id_seq'), '보통이다', 10, 10),
(currval('mbti_question_question_id_seq'), '아니다', 5, 15),
(currval('mbti_question_question_id_seq'), '매우 아니다', 0, 20);

-- Q5. EI
INSERT INTO mbti_question (content, dimension, sort_order) VALUES ('많은 사람들 앞에서 주목받거나 분위기를 주도하는 상황이 오면 즐겁고 신이 난다.', 'EI', 5);
INSERT INTO mbti_choice (question_id, content, score_a, score_b) VALUES 
(currval('mbti_question_question_id_seq'), '매우 그렇다', 20, 0),
(currval('mbti_question_question_id_seq'), '그렇다', 15, 5),
(currval('mbti_question_question_id_seq'), '보통이다', 10, 10),
(currval('mbti_question_question_id_seq'), '아니다', 5, 15),
(currval('mbti_question_question_id_seq'), '매우 아니다', 0, 20);

-- Q6. SN
INSERT INTO mbti_question (content, dimension, sort_order) VALUES ('일을 처리할 때 꼼꼼한 세부 사항보다는 전체적인 흐름이나 큰 그림을 먼저 파악하려 한다.', 'SN', 6);
INSERT INTO mbti_choice (question_id, content, score_a, score_b) VALUES 
(currval('mbti_question_question_id_seq'), '매우 그렇다', 0, 20), -- S
(currval('mbti_question_question_id_seq'), '그렇다', 5, 15),
(currval('mbti_question_question_id_seq'), '보통이다', 10, 10),
(currval('mbti_question_question_id_seq'), '아니다', 15, 5),
(currval('mbti_question_question_id_seq'), '매우 아니다',20, 0);

-- Q7. SN
INSERT INTO mbti_question (content, dimension, sort_order) VALUES ('현실적인 문제 해결보다는 "만약에 좀비 사태가 일어난다면?" 같은 엉뚱한 상상을 자주 한다.', 'SN', 7);
INSERT INTO mbti_choice (question_id, content, score_a, score_b) VALUES 
(currval('mbti_question_question_id_seq'), '매우 그렇다', 0, 20), -- S
(currval('mbti_question_question_id_seq'), '그렇다', 5, 15),
(currval('mbti_question_question_id_seq'), '보통이다', 10, 10),
(currval('mbti_question_question_id_seq'), '아니다', 15, 5),
(currval('mbti_question_question_id_seq'), '매우 아니다',20, 0);

-- Q8. SN
INSERT INTO mbti_question (content, dimension, sort_order) VALUES ('이미 검증된 익숙한 방식보다는 위험 부담이 있더라도 새롭고 독창적인 방법을 시도하는 것이 좋다.', 'SN', 8);
INSERT INTO mbti_choice (question_id, content, score_a, score_b) VALUES 
(currval('mbti_question_question_id_seq'), '매우 그렇다', 0, 20), -- S
(currval('mbti_question_question_id_seq'), '그렇다', 5, 15),
(currval('mbti_question_question_id_seq'), '보통이다', 10, 10),
(currval('mbti_question_question_id_seq'), '아니다', 15, 5),
(currval('mbti_question_question_id_seq'), '매우 아니다',20, 0);

-- Q9. SN
INSERT INTO mbti_question (content, dimension, sort_order) VALUES ('구체적인 사실이나 사건을 나열하는 대화보다는 추상적인 개념이나 철학적인 주제로 토론하는 것을 더 즐긴다.', 'SN', 9);
INSERT INTO mbti_choice (question_id, content, score_a, score_b) VALUES 
(currval('mbti_question_question_id_seq'), '매우 그렇다', 0, 20), -- S
(currval('mbti_question_question_id_seq'), '그렇다', 5, 15),
(currval('mbti_question_question_id_seq'), '보통이다', 10, 10),
(currval('mbti_question_question_id_seq'), '아니다', 15, 5),
(currval('mbti_question_question_id_seq'), '매우 아니다',20, 0);

-- Q10. SN
INSERT INTO mbti_question (content, dimension, sort_order) VALUES ('사물이나 사건을 있는 그대로 받아들이기보다, 그 이면에 숨겨진 의미나 패턴을 찾으려고 노력한다.', 'SN', 10);
INSERT INTO mbti_choice (question_id, content, score_a, score_b) VALUES 
(currval('mbti_question_question_id_seq'), '매우 그렇다', 0, 20), -- S
(currval('mbti_question_question_id_seq'), '그렇다', 5, 15),
(currval('mbti_question_question_id_seq'), '보통이다', 10, 10),
(currval('mbti_question_question_id_seq'), '아니다', 15, 5),
(currval('mbti_question_question_id_seq'), '매우 아니다',20, 0);

-- Q11. TF
INSERT INTO mbti_question (content, dimension, sort_order) VALUES ('중요한 결정을 내릴 때, 내 선택이 타인에게 미칠 감정적 영향보다 논리적인 합리성을 더 우선순위에 둔다.', 'TF', 11);
INSERT INTO mbti_choice (question_id, content, score_a, score_b) VALUES 
(currval('mbti_question_question_id_seq'), '매우 그렇다', 20, 0), -- T
(currval('mbti_question_question_id_seq'), '그렇다', 15, 5),
(currval('mbti_question_question_id_seq'), '보통이다', 10, 10),
(currval('mbti_question_question_id_seq'), '아니다', 5, 15),
(currval('mbti_question_question_id_seq'), '매우 아니다', 0, 20);

-- Q12. TF
INSERT INTO mbti_question (content, dimension, sort_order) VALUES ('친구가 고민을 털어놓으면 감정적인 위로보다는 문제의 원인을 분석하고 해결책을 제시해 주는 편이다.', 'TF', 12);
INSERT INTO mbti_choice (question_id, content, score_a, score_b) VALUES 
(currval('mbti_question_question_id_seq'), '매우 그렇다', 20, 0), -- T
(currval('mbti_question_question_id_seq'), '그렇다', 15, 5),
(currval('mbti_question_question_id_seq'), '보통이다', 10, 10),
(currval('mbti_question_question_id_seq'), '아니다', 5, 15),
(currval('mbti_question_question_id_seq'), '매우 아니다', 0, 20);

-- Q13. TF
INSERT INTO mbti_question (content, dimension, sort_order) VALUES ('토론 중에는 상대방의 기분이 다소 상하더라도 사실 관계를 명확히 바로잡는 것이 더 중요하다.', 'TF', 13);
INSERT INTO mbti_choice (question_id, content, score_a, score_b) VALUES 
(currval('mbti_question_question_id_seq'), '매우 그렇다', 20, 0), -- T
(currval('mbti_question_question_id_seq'), '그렇다', 15, 5),
(currval('mbti_question_question_id_seq'), '보통이다', 10, 10),
(currval('mbti_question_question_id_seq'), '아니다', 5, 15),
(currval('mbti_question_question_id_seq'), '매우 아니다', 0, 20);

-- Q14. TF
INSERT INTO mbti_question (content, dimension, sort_order) VALUES ('일을 할 때 "좋다/나쁘다"의 감정적 판단보다는 "맞다/틀리다"의 시비 판단이 더 빠르고 편하다.', 'TF', 14);
INSERT INTO mbti_choice (question_id, content, score_a, score_b) VALUES 
(currval('mbti_question_question_id_seq'), '매우 그렇다', 20, 0), -- T
(currval('mbti_question_question_id_seq'), '그렇다', 15, 5),
(currval('mbti_question_question_id_seq'), '보통이다', 10, 10),
(currval('mbti_question_question_id_seq'), '아니다', 5, 15),
(currval('mbti_question_question_id_seq'), '매우 아니다', 0, 20);

-- Q15. TF
INSERT INTO mbti_question (content, dimension, sort_order) VALUES ('빈말뿐인 칭찬보다는 나의 부족한 점을 정확히 짚어주는 객관적인 비판이 성장에 더 도움이 된다고 믿는다.', 'TF', 15);
INSERT INTO mbti_choice (question_id, content, score_a, score_b) VALUES 
(currval('mbti_question_question_id_seq'), '매우 그렇다', 20, 0), -- T
(currval('mbti_question_question_id_seq'), '그렇다', 15, 5),
(currval('mbti_question_question_id_seq'), '보통이다', 10, 10),
(currval('mbti_question_question_id_seq'), '아니다', 5, 15),
(currval('mbti_question_question_id_seq'), '매우 아니다', 0, 20);

-- Q16. JP
INSERT INTO mbti_question (content, dimension, sort_order) VALUES ('어떤 일을 시작하기 전에 목표와 단계별 절차를 명확히 설정하고 그대로 따르는 것을 선호한다.', 'JP', 16);
INSERT INTO mbti_choice (question_id, content, score_a, score_b) VALUES 
(currval('mbti_question_question_id_seq'), '매우 그렇다', 20, 0), -- J
(currval('mbti_question_question_id_seq'), '그렇다', 15, 5),
(currval('mbti_question_question_id_seq'), '보통이다', 10, 10),
(currval('mbti_question_question_id_seq'), '아니다', 5, 15),
(currval('mbti_question_question_id_seq'), '매우 아니다', 0, 20);

-- Q17. JP
INSERT INTO mbti_question (content, dimension, sort_order) VALUES ('여행을 갈 때 분 단위나 시간 단위로 세부적인 계획을 짜고, 동선까지 미리 파악해두어야 마음이 편하다.', 'JP', 17);
INSERT INTO mbti_choice (question_id, content, score_a, score_b) VALUES 
(currval('mbti_question_question_id_seq'), '매우 그렇다', 20, 0), -- J
(currval('mbti_question_question_id_seq'), '그렇다', 15, 5),
(currval('mbti_question_question_id_seq'), '보통이다', 10, 10),
(currval('mbti_question_question_id_seq'), '아니다', 5, 15),
(currval('mbti_question_question_id_seq'), '매우 아니다', 0, 20);

-- Q18. JP
INSERT INTO mbti_question (content, dimension, sort_order) VALUES ('과제나 업무를 마감 직전에 닥쳐서 처리하기보다, 미리미리 끝내놓고 여유를 즐기는 것을 선호한다.', 'JP', 18);
INSERT INTO mbti_choice (question_id, content, score_a, score_b) VALUES 
(currval('mbti_question_question_id_seq'), '매우 그렇다', 20, 0), -- J
(currval('mbti_question_question_id_seq'), '그렇다', 15, 5),
(currval('mbti_question_question_id_seq'), '보통이다', 10, 10),
(currval('mbti_question_question_id_seq'), '아니다', 5, 15),
(currval('mbti_question_question_id_seq'), '매우 아니다', 0, 20);

-- Q19. JP
INSERT INTO mbti_question (content, dimension, sort_order) VALUES ('갑작스러운 약속 변경이나 예상치 못한 변수로 인해 세워둔 계획이 틀어지는 상황을 매우 싫어한다.', 'JP', 19);
INSERT INTO mbti_choice (question_id, content, score_a, score_b) VALUES 
(currval('mbti_question_question_id_seq'), '매우 그렇다', 20, 0), -- J
(currval('mbti_question_question_id_seq'), '그렇다', 15, 5),
(currval('mbti_question_question_id_seq'), '보통이다', 10, 10),
(currval('mbti_question_question_id_seq'), '아니다', 5, 15),
(currval('mbti_question_question_id_seq'), '매우 아니다', 0, 20);

-- Q20. JP
INSERT INTO mbti_question (content, dimension, sort_order) VALUES ('평소에 책상 위나 컴퓨터 파일 등을 규칙에 따라 체계적으로 정리 정돈해두는 것을 좋아한다.', 'JP', 20);
INSERT INTO mbti_choice (question_id, content, score_a, score_b) VALUES 
(currval('mbti_question_question_id_seq'), '매우 그렇다', 20, 0), -- J
(currval('mbti_question_question_id_seq'), '그렇다', 15, 5),
(currval('mbti_question_question_id_seq'), '보통이다', 10, 10),
(currval('mbti_question_question_id_seq'), '아니다', 5, 15),
(currval('mbti_question_question_id_seq'), '매우 아니다', 0, 20);
