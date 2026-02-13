-- =======================================================
-- V51__seed_mbti_i18n_data.sql
-- MBTI Question & Choice i18n Seed Data (English & Japanese)
-- =======================================================

-- ============================================================
-- MBTI Question i18n (English)
-- ============================================================

INSERT INTO mbti_question_i18n (question_id, locale, content) VALUES
(1, 'en', 'After a tough day, I feel stressed and need to spend time with friends rather than being alone.'),
(2, 'en', 'In new gatherings or unfamiliar places, I feel comfortable initiating conversations with people I just met.'),
(3, 'en', 'I prefer to organize my thoughts by talking them out rather than processing them internally.'),
(4, 'en', 'I feel restless when at home on weekends and want to go out for activities.'),
(5, 'en', 'I feel excited and energized when leading situations or drawing attention from many people.'),
(6, 'en', 'When working, I focus on the big picture and overall flow rather than detailed specifics.'),
(7, 'en', 'I often think about unrealistic scenarios like "What if a zombie apocalypse happened?" rather than practical problem-solving.'),
(8, 'en', 'I prefer trying new and creative methods even if they involve risk, over relying on proven conventional approaches.'),
(9, 'en', 'I enjoy discussing abstract concepts and philosophical topics more than exchanging concrete facts and events.'),
(10, 'en', 'I tend to look for hidden meanings and patterns in things rather than accepting them at face value.'),
(11, 'en', 'When making important decisions, I prioritize logical rationality over how my choices might emotionally affect others.'),
(12, 'en', 'When friends share concerns, I analyze the root cause and suggest solutions rather than providing emotional support.'),
(13, 'en', 'During discussions, I think it is more important to clarify facts even if it upsets the other person.'),
(14, 'en', 'At work, I find it easier and faster to make judgments based on "right/wrong" rather than "good/bad."'),
(15, 'en', 'I believe objective criticism pointing out my weaknesses helps my growth more than empty compliments.'),
(16, 'en', 'I prefer to set clear goals and step-by-step procedures before starting a task and follow them accordingly.'),
(17, 'en', 'When traveling, I feel comfortable only after planning details minute by minute and mapping out routes in advance.'),
(18, 'en', 'I prefer to finish tasks and assignments early rather than working on them at the last minute.'),
(19, 'en', 'I strongly dislike when unexpected changes or plans falling through disrupt my schedule.'),
(20, 'en', 'I like organizing my desk, files, and digital folders systematically and neatly.');

-- ============================================================
-- MBTI Choice i18n (English)
-- ============================================================

-- For all choices (1-100, assuming 5 choices per question)
-- Choice content: Strongly Agree, Agree, Neutral, Disagree, Strongly Disagree

-- Q1 Choices
INSERT INTO mbti_choice_i18n (choice_id, locale, content) VALUES
((SELECT choice_id FROM mbti_choice WHERE question_id=1 AND content='매우 그렇다' LIMIT 1), 'en', 'Strongly Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=1 AND content='그렇다' LIMIT 1), 'en', 'Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=1 AND content='보통이다' LIMIT 1), 'en', 'Neutral'),
((SELECT choice_id FROM mbti_choice WHERE question_id=1 AND content='아니다' LIMIT 1), 'en', 'Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=1 AND content='매우 아니다' LIMIT 1), 'en', 'Strongly Disagree');

-- Q2-Q5 Choices (Same structure as Q1)
INSERT INTO mbti_choice_i18n (choice_id, locale, content) VALUES
((SELECT choice_id FROM mbti_choice WHERE question_id=2 AND content='매우 그렇다' LIMIT 1), 'en', 'Strongly Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=2 AND content='그렇다' LIMIT 1), 'en', 'Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=2 AND content='보통이다' LIMIT 1), 'en', 'Neutral'),
((SELECT choice_id FROM mbti_choice WHERE question_id=2 AND content='아니다' LIMIT 1), 'en', 'Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=2 AND content='매우 아니다' LIMIT 1), 'en', 'Strongly Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=3 AND content='매우 그렇다' LIMIT 1), 'en', 'Strongly Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=3 AND content='그렇다' LIMIT 1), 'en', 'Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=3 AND content='보통이다' LIMIT 1), 'en', 'Neutral'),
((SELECT choice_id FROM mbti_choice WHERE question_id=3 AND content='아니다' LIMIT 1), 'en', 'Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=3 AND content='매우 아니다' LIMIT 1), 'en', 'Strongly Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=4 AND content='매우 그렇다' LIMIT 1), 'en', 'Strongly Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=4 AND content='그렇다' LIMIT 1), 'en', 'Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=4 AND content='보통이다' LIMIT 1), 'en', 'Neutral'),
((SELECT choice_id FROM mbti_choice WHERE question_id=4 AND content='아니다' LIMIT 1), 'en', 'Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=4 AND content='매우 아니다' LIMIT 1), 'en', 'Strongly Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=5 AND content='매우 그렇다' LIMIT 1), 'en', 'Strongly Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=5 AND content='그렇다' LIMIT 1), 'en', 'Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=5 AND content='보통이다' LIMIT 1), 'en', 'Neutral'),
((SELECT choice_id FROM mbti_choice WHERE question_id=5 AND content='아니다' LIMIT 1), 'en', 'Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=5 AND content='매우 아니다' LIMIT 1), 'en', 'Strongly Disagree');

-- Q6-Q10 Choices
INSERT INTO mbti_choice_i18n (choice_id, locale, content) VALUES
((SELECT choice_id FROM mbti_choice WHERE question_id=6 AND content='매우 그렇다' LIMIT 1), 'en', 'Strongly Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=6 AND content='그렇다' LIMIT 1), 'en', 'Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=6 AND content='보통이다' LIMIT 1), 'en', 'Neutral'),
((SELECT choice_id FROM mbti_choice WHERE question_id=6 AND content='아니다' LIMIT 1), 'en', 'Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=6 AND content='매우 아니다' LIMIT 1), 'en', 'Strongly Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=7 AND content='매우 그렇다' LIMIT 1), 'en', 'Strongly Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=7 AND content='그렇다' LIMIT 1), 'en', 'Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=7 AND content='보통이다' LIMIT 1), 'en', 'Neutral'),
((SELECT choice_id FROM mbti_choice WHERE question_id=7 AND content='아니다' LIMIT 1), 'en', 'Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=7 AND content='매우 아니다' LIMIT 1), 'en', 'Strongly Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=8 AND content='매우 그렇다' LIMIT 1), 'en', 'Strongly Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=8 AND content='그렇다' LIMIT 1), 'en', 'Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=8 AND content='보통이다' LIMIT 1), 'en', 'Neutral'),
((SELECT choice_id FROM mbti_choice WHERE question_id=8 AND content='아니다' LIMIT 1), 'en', 'Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=8 AND content='매우 아니다' LIMIT 1), 'en', 'Strongly Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=9 AND content='매우 그렇다' LIMIT 1), 'en', 'Strongly Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=9 AND content='그렇다' LIMIT 1), 'en', 'Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=9 AND content='보통이다' LIMIT 1), 'en', 'Neutral'),
((SELECT choice_id FROM mbti_choice WHERE question_id=9 AND content='아니다' LIMIT 1), 'en', 'Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=9 AND content='매우 아니다' LIMIT 1), 'en', 'Strongly Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=10 AND content='매우 그렇다' LIMIT 1), 'en', 'Strongly Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=10 AND content='그렇다' LIMIT 1), 'en', 'Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=10 AND content='보통이다' LIMIT 1), 'en', 'Neutral'),
((SELECT choice_id FROM mbti_choice WHERE question_id=10 AND content='아니다' LIMIT 1), 'en', 'Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=10 AND content='매우 아니다' LIMIT 1), 'en', 'Strongly Disagree');

-- Q11-Q15 Choices
INSERT INTO mbti_choice_i18n (choice_id, locale, content) VALUES
((SELECT choice_id FROM mbti_choice WHERE question_id=11 AND content='매우 그렇다' LIMIT 1), 'en', 'Strongly Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=11 AND content='그렇다' LIMIT 1), 'en', 'Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=11 AND content='보통이다' LIMIT 1), 'en', 'Neutral'),
((SELECT choice_id FROM mbti_choice WHERE question_id=11 AND content='아니다' LIMIT 1), 'en', 'Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=11 AND content='매우 아니다' LIMIT 1), 'en', 'Strongly Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=12 AND content='매우 그렇다' LIMIT 1), 'en', 'Strongly Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=12 AND content='그렇다' LIMIT 1), 'en', 'Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=12 AND content='보통이다' LIMIT 1), 'en', 'Neutral'),
((SELECT choice_id FROM mbti_choice WHERE question_id=12 AND content='아니다' LIMIT 1), 'en', 'Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=12 AND content='매우 아니다' LIMIT 1), 'en', 'Strongly Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=13 AND content='매우 그렇다' LIMIT 1), 'en', 'Strongly Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=13 AND content='그렇다' LIMIT 1), 'en', 'Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=13 AND content='보통이다' LIMIT 1), 'en', 'Neutral'),
((SELECT choice_id FROM mbti_choice WHERE question_id=13 AND content='아니다' LIMIT 1), 'en', 'Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=13 AND content='매우 아니다' LIMIT 1), 'en', 'Strongly Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=14 AND content='매우 그렇다' LIMIT 1), 'en', 'Strongly Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=14 AND content='그렇다' LIMIT 1), 'en', 'Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=14 AND content='보통이다' LIMIT 1), 'en', 'Neutral'),
((SELECT choice_id FROM mbti_choice WHERE question_id=14 AND content='아니다' LIMIT 1), 'en', 'Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=14 AND content='매우 아니다' LIMIT 1), 'en', 'Strongly Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=15 AND content='매우 그렇다' LIMIT 1), 'en', 'Strongly Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=15 AND content='그렇다' LIMIT 1), 'en', 'Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=15 AND content='보통이다' LIMIT 1), 'en', 'Neutral'),
((SELECT choice_id FROM mbti_choice WHERE question_id=15 AND content='아니다' LIMIT 1), 'en', 'Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=15 AND content='매우 아니다' LIMIT 1), 'en', 'Strongly Disagree');

-- Q16-Q20 Choices
INSERT INTO mbti_choice_i18n (choice_id, locale, content) VALUES
((SELECT choice_id FROM mbti_choice WHERE question_id=16 AND content='매우 그렇다' LIMIT 1), 'en', 'Strongly Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=16 AND content='그렇다' LIMIT 1), 'en', 'Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=16 AND content='보통이다' LIMIT 1), 'en', 'Neutral'),
((SELECT choice_id FROM mbti_choice WHERE question_id=16 AND content='아니다' LIMIT 1), 'en', 'Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=16 AND content='매우 아니다' LIMIT 1), 'en', 'Strongly Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=17 AND content='매우 그렇다' LIMIT 1), 'en', 'Strongly Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=17 AND content='그렇다' LIMIT 1), 'en', 'Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=17 AND content='보통이다' LIMIT 1), 'en', 'Neutral'),
((SELECT choice_id FROM mbti_choice WHERE question_id=17 AND content='아니다' LIMIT 1), 'en', 'Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=17 AND content='매우 아니다' LIMIT 1), 'en', 'Strongly Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=18 AND content='매우 그렇다' LIMIT 1), 'en', 'Strongly Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=18 AND content='그렇다' LIMIT 1), 'en', 'Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=18 AND content='보통이다' LIMIT 1), 'en', 'Neutral'),
((SELECT choice_id FROM mbti_choice WHERE question_id=18 AND content='아니다' LIMIT 1), 'en', 'Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=18 AND content='매우 아니다' LIMIT 1), 'en', 'Strongly Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=19 AND content='매우 그렇다' LIMIT 1), 'en', 'Strongly Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=19 AND content='그렇다' LIMIT 1), 'en', 'Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=19 AND content='보통이다' LIMIT 1), 'en', 'Neutral'),
((SELECT choice_id FROM mbti_choice WHERE question_id=19 AND content='아니다' LIMIT 1), 'en', 'Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=19 AND content='매우 아니다' LIMIT 1), 'en', 'Strongly Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=20 AND content='매우 그렇다' LIMIT 1), 'en', 'Strongly Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=20 AND content='그렇다' LIMIT 1), 'en', 'Agree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=20 AND content='보통이다' LIMIT 1), 'en', 'Neutral'),
((SELECT choice_id FROM mbti_choice WHERE question_id=20 AND content='아니다' LIMIT 1), 'en', 'Disagree'),
((SELECT choice_id FROM mbti_choice WHERE question_id=20 AND content='매우 아니다' LIMIT 1), 'en', 'Strongly Disagree');


-- ============================================================
-- MBTI Question i18n (Japanese)
-- ============================================================

INSERT INTO mbti_question_i18n (question_id, locale, content) VALUES
(1, 'ja', '疲れた1日を過ごした後は、一人で休むよりも友人に会ってお喋りをしてストレスを解消したい。'),
(2, 'ja', '新しい集まりや見知らぬ場所でも違和感なく初対面の人に先に話しかけるほうだ。'),
(3, 'ja', '頭の中で一人で考えをまとめるよりも、まずは口に出して喋りながら整理するほうが好きだ。'),
(4, 'ja', '週末や休日に家にいるだけでは退屈で、外に出かけて活動したいと思う。'),
(5, 'ja', '大勢の人の前で注目されたり雰囲気を主導する状況になると、楽しくて気分が高ぶる。'),
(6, 'ja', '仕事をするときは細かい詳細よりも全体的な流れや大きな流れをまず把握しようとする。'),
(7, 'ja', '現実的な問題解決よりも「もし僵尸のパニックが起きたら？」みたいな場外れな想像をよくする。'),
(8, 'ja', 'すでに検証された慣れた方法よりも、リスクがあっても新しく独創的な方法を試すほうが好きだ。'),
(9, 'ja', '具体的な事実や出来事を列挙する会話よりも、抽象的な概念や哲学的なテーマについて議論するほうが楽しい。'),
(10, 'ja', '物事や出来事をあるがままに受け入れるよりも、その背後に隠された意味やパターンを見つけようとする。'),
(11, 'ja', '重要な決定を下すときは、自分の選択が他者に与える感情的な影響よりも論理的な合理性を優先する。'),
(12, 'ja', '友人が悩みを打ち明けるときは、感情的な慰めよりも問題の原因を分析して解決策を提示するほうだ。'),
(13, 'ja', '議論の最中は相手の気分が多少傷つくとしても、事実関係を明確に正すほうがより重要だと思う。'),
(14, 'ja', '仕事をするときは「良い/悪い」という感情的な判断よりも「正しい/間違い」という是非判断のほうが速くて楽だ。'),
(15, 'ja', '建前だけの褒め言葉よりも自分の足りない点を正確に指摘する客観的な批判のほうが成長に役立つと信じている。'),
(16, 'ja', 'ある仕事を始める前に目標とステップバイステップの手順を明確に設定して、その通りに従うほうが好きだ。'),
(17, 'ja', '旅行に行くときは分単位、時間単位で細かく計画を立てて、動線さえ事前に把握していないと気が楽にならない。'),
(18, 'ja', 'タスクや課題を締め切り直前に処理するよりも、事前に終わらせてゆとりを楽しむほうが好きだ。'),
(19, 'ja', '急な約束の変更や予想外の変数で立てた計画がずれる状況をすごく嫌いだ。'),
(20, 'ja', 'ふだんから机の上やコンピュータファイルなどを規則に従ってシステマティックに整理整頓するのが好きだ。');

-- ============================================================
-- MBTI Choice i18n (Japanese)
-- ============================================================

-- Q1-Q5 Choices (Japanese)
INSERT INTO mbti_choice_i18n (choice_id, locale, content) VALUES
((SELECT choice_id FROM mbti_choice WHERE question_id=1 AND content='매우 그렇다' LIMIT 1), 'ja', 'よくあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=1 AND content='그렇다' LIMIT 1), 'ja', 'ややあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=1 AND content='보통이다' LIMIT 1), 'ja', 'どちらでもない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=1 AND content='아니다' LIMIT 1), 'ja', 'ややあてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=1 AND content='매우 아니다' LIMIT 1), 'ja', 'あてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=2 AND content='매우 그렇다' LIMIT 1), 'ja', 'よくあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=2 AND content='그렇다' LIMIT 1), 'ja', 'ややあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=2 AND content='보통이다' LIMIT 1), 'ja', 'どちらでもない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=2 AND content='아니다' LIMIT 1), 'ja', 'ややあてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=2 AND content='매우 아니다' LIMIT 1), 'ja', 'あてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=3 AND content='매우 그렇다' LIMIT 1), 'ja', 'よくあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=3 AND content='그렇다' LIMIT 1), 'ja', 'ややあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=3 AND content='보통이다' LIMIT 1), 'ja', 'どちらでもない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=3 AND content='아니다' LIMIT 1), 'ja', 'ややあてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=3 AND content='매우 아니다' LIMIT 1), 'ja', 'あてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=4 AND content='매우 그렇다' LIMIT 1), 'ja', 'よくあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=4 AND content='그렇다' LIMIT 1), 'ja', 'ややあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=4 AND content='보통이다' LIMIT 1), 'ja', 'どちらでもない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=4 AND content='아니다' LIMIT 1), 'ja', 'ややあてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=4 AND content='매우 아니다' LIMIT 1), 'ja', 'あてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=5 AND content='매우 그렇다' LIMIT 1), 'ja', 'よくあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=5 AND content='그렇다' LIMIT 1), 'ja', 'ややあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=5 AND content='보통이다' LIMIT 1), 'ja', 'どちらでもない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=5 AND content='아니다' LIMIT 1), 'ja', 'ややあてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=5 AND content='매우 아니다' LIMIT 1), 'ja', 'あてはまらない');

-- Q6-Q10 Choices (Japanese)
INSERT INTO mbti_choice_i18n (choice_id, locale, content) VALUES
((SELECT choice_id FROM mbti_choice WHERE question_id=6 AND content='매우 그렇다' LIMIT 1), 'ja', 'よくあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=6 AND content='그렇다' LIMIT 1), 'ja', 'ややあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=6 AND content='보통이다' LIMIT 1), 'ja', 'どちらでもない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=6 AND content='아니다' LIMIT 1), 'ja', 'ややあてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=6 AND content='매우 아니다' LIMIT 1), 'ja', 'あてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=7 AND content='매우 그렇다' LIMIT 1), 'ja', 'よくあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=7 AND content='그렇다' LIMIT 1), 'ja', 'ややあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=7 AND content='보통이다' LIMIT 1), 'ja', 'どちらでもない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=7 AND content='아니다' LIMIT 1), 'ja', 'ややあてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=7 AND content='매우 아니다' LIMIT 1), 'ja', 'あてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=8 AND content='매우 그렇다' LIMIT 1), 'ja', 'よくあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=8 AND content='그렇다' LIMIT 1), 'ja', 'ややあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=8 AND content='보통이다' LIMIT 1), 'ja', 'どちらでもない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=8 AND content='아니다' LIMIT 1), 'ja', 'ややあてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=8 AND content='매우 아니다' LIMIT 1), 'ja', 'あてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=9 AND content='매우 그렇다' LIMIT 1), 'ja', 'よくあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=9 AND content='그렇다' LIMIT 1), 'ja', 'ややあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=9 AND content='보통이다' LIMIT 1), 'ja', 'どちらでもない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=9 AND content='아니다' LIMIT 1), 'ja', 'ややあてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=9 AND content='매우 아니다' LIMIT 1), 'ja', 'あてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=10 AND content='매우 그렇다' LIMIT 1), 'ja', 'よくあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=10 AND content='그렇다' LIMIT 1), 'ja', 'ややあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=10 AND content='보통이다' LIMIT 1), 'ja', 'どちらでもない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=10 AND content='아니다' LIMIT 1), 'ja', 'ややあてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=10 AND content='매우 아니다' LIMIT 1), 'ja', 'あてはまらない');

-- Q11-Q15 Choices (Japanese)
INSERT INTO mbti_choice_i18n (choice_id, locale, content) VALUES
((SELECT choice_id FROM mbti_choice WHERE question_id=11 AND content='매우 그렇다' LIMIT 1), 'ja', 'よくあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=11 AND content='그렇다' LIMIT 1), 'ja', 'ややあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=11 AND content='보통이다' LIMIT 1), 'ja', 'どちらでもない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=11 AND content='아니다' LIMIT 1), 'ja', 'ややあてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=11 AND content='매우 아니다' LIMIT 1), 'ja', 'あてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=12 AND content='매우 그렇다' LIMIT 1), 'ja', 'よくあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=12 AND content='그렇다' LIMIT 1), 'ja', 'ややあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=12 AND content='보통이다' LIMIT 1), 'ja', 'どちらでもない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=12 AND content='아니다' LIMIT 1), 'ja', 'ややあてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=12 AND content='매우 아니다' LIMIT 1), 'ja', 'あてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=13 AND content='매우 그렇다' LIMIT 1), 'ja', 'よくあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=13 AND content='그렇다' LIMIT 1), 'ja', 'ややあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=13 AND content='보통이다' LIMIT 1), 'ja', 'どちらでもない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=13 AND content='아니다' LIMIT 1), 'ja', 'ややあてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=13 AND content='매우 아니다' LIMIT 1), 'ja', 'あてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=14 AND content='매우 그렇다' LIMIT 1), 'ja', 'よくあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=14 AND content='그렇다' LIMIT 1), 'ja', 'ややあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=14 AND content='보통이다' LIMIT 1), 'ja', 'どちらでもない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=14 AND content='아니다' LIMIT 1), 'ja', 'ややあてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=14 AND content='매우 아니다' LIMIT 1), 'ja', 'あてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=15 AND content='매우 그렇다' LIMIT 1), 'ja', 'よくあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=15 AND content='그렇다' LIMIT 1), 'ja', 'ややあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=15 AND content='보통이다' LIMIT 1), 'ja', 'どちらでもない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=15 AND content='아니다' LIMIT 1), 'ja', 'ややあてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=15 AND content='매우 아니다' LIMIT 1), 'ja', 'あてはまらない');

-- Q16-Q20 Choices (Japanese)
INSERT INTO mbti_choice_i18n (choice_id, locale, content) VALUES
((SELECT choice_id FROM mbti_choice WHERE question_id=16 AND content='매우 그렇다' LIMIT 1), 'ja', 'よくあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=16 AND content='그렇다' LIMIT 1), 'ja', 'ややあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=16 AND content='보통이다' LIMIT 1), 'ja', 'どちらでもない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=16 AND content='아니다' LIMIT 1), 'ja', 'ややあてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=16 AND content='매우 아니다' LIMIT 1), 'ja', 'あてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=17 AND content='매우 그렇다' LIMIT 1), 'ja', 'よくあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=17 AND content='그렇다' LIMIT 1), 'ja', 'ややあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=17 AND content='보통이다' LIMIT 1), 'ja', 'どちらでもない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=17 AND content='아니다' LIMIT 1), 'ja', 'ややあてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=17 AND content='매우 아니다' LIMIT 1), 'ja', 'あてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=18 AND content='매우 그렇다' LIMIT 1), 'ja', 'よくあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=18 AND content='그렇다' LIMIT 1), 'ja', 'ややあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=18 AND content='보통이다' LIMIT 1), 'ja', 'どちらでもない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=18 AND content='아니다' LIMIT 1), 'ja', 'ややあてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=18 AND content='매우 아니다' LIMIT 1), 'ja', 'あてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=19 AND content='매우 그렇다' LIMIT 1), 'ja', 'よくあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=19 AND content='그렇다' LIMIT 1), 'ja', 'ややあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=19 AND content='보통이다' LIMIT 1), 'ja', 'どちらでもない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=19 AND content='아니다' LIMIT 1), 'ja', 'ややあてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=19 AND content='매우 아니다' LIMIT 1), 'ja', 'あてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=20 AND content='매우 그렇다' LIMIT 1), 'ja', 'よくあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=20 AND content='그렇다' LIMIT 1), 'ja', 'ややあてはまる'),
((SELECT choice_id FROM mbti_choice WHERE question_id=20 AND content='보통이다' LIMIT 1), 'ja', 'どちらでもない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=20 AND content='아니다' LIMIT 1), 'ja', 'ややあてはまらない'),
((SELECT choice_id FROM mbti_choice WHERE question_id=20 AND content='매우 아니다' LIMIT 1), 'ja', 'あてはまらない');
