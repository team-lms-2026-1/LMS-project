"use client";

import { Button } from "@/components/button";
import { useState } from "react";
import toast from "react-hot-toast";
import styles from "./MbtiClient.module.css";
import { useMbtiQuestions, useMbtiResult } from "../hooks/useMbti";
import { submitMbtiAnswers } from "../api/mbtiApi";
import { MbtiSubmitRequest } from "../api/types";

export default function MbtiClient() {
    const { state: resultState, actions: resultActions } = useMbtiResult();
    const { state: questionState } = useMbtiQuestions(!resultState.data); // 결과가 없으면 질문 로딩

    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [submitting, setSubmitting] = useState(false);

    // 결과 로딩 중
    if (resultState.loading) {
        return <div className={styles.loading}>정보 불러오는 중...</div>;
    }

    // 결과 조회 실패 혹은 에러
    if (resultState.error && !resultState.data) {
        // 에러가 있어도 질문을 보여줄지 여부는 정책에 따라 다름. 
        // 여기서는 에러 메시지 노출
        // 다만 404(결과 없음)일 때 에러가 오는 구조라면 예외 처리 필요.
        // 우선 API가 결과 없을 때 200 null을 주는지 404 에러를 주는지 확실치 않으나
        // useMbtiResult에서 에러 발생 시 여기로 옴.
        // 만약 '결과 없음'이 에러가 아니라 null data라면 아래 로직으로 넘어감.
    }

    // 결과가 있으면 결과 화면
    if (resultState.data) {
        const { mbtiType, score } = resultState.data;
        return (
            <div className={styles.container}>
                <div className={styles.resultContainer}>
                    <h1 className={styles.pageTitle}>나의 MBTI 분석 결과</h1>
                    <div className={styles.mbtiType}>{mbtiType}</div>
                    <p className={styles.resultDesc}>
                        당신의 학습 성향은 <strong>{mbtiType}</strong> 입니다.<br />
                        AI Advisor가 당신의 성향에 맞는 커리큘럼을 추천해드립니다.
                    </p>

                    <div className={styles.resultChart}>
                        <ComparisonBar
                            leftLabel="E" rightLabel="I"
                            leftScore={score.e} rightScore={score.i}
                            leftColor="#e74c3c" rightColor="#3498db"
                            rowClass={styles['row-EI']}
                        />
                        <ComparisonBar
                            leftLabel="S" rightLabel="N"
                            leftScore={score.s} rightScore={score.n}
                            leftColor="#f1c40f" rightColor="#9b59b6"
                            rowClass={styles['row-SN']}
                        />
                        <ComparisonBar
                            leftLabel="T" rightLabel="F"
                            leftScore={score.t} rightScore={score.f}
                            leftColor="#2ecc71" rightColor="#e67e22"
                            rowClass={styles['row-TF']}
                        />
                        <ComparisonBar
                            leftLabel="J" rightLabel="P"
                            leftScore={score.j} rightScore={score.p}
                            leftColor="#1abc9c" rightColor="#34495e"
                            rowClass={styles['row-JP']}
                        />
                    </div>

                    <div className={styles.actionArea}>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                if (confirm("다시 검사하시겠습니까? 기존 결과는 사라집니다.")) {
                                    resultActions.setData(null);
                                    setAnswers({});
                                }
                            }}
                        >
                            다시 검사하기
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // 질문 로딩 중
    if (questionState.loading) {
        return <div className={styles.loading}>질문 불러오는 중...</div>;
    }

    // 질문 에러
    if (questionState.error) {
        return <div className={styles.error}>{questionState.error}</div>;
    }

    // 질문 목록 렌더링
    const questions = questionState.data || [];

    // 답변 선택 핸들러
    const handleSelect = (qId: number, cId: number) => {
        setAnswers(prev => ({ ...prev, [qId]: cId }));
    };

    // 제출 핸들러
    const handleSubmit = async () => {
        if (Object.keys(answers).length < questions.length) {
            toast.error("모든 문항에 답변해주세요.");
            return;
        }

        if (!confirm("제출하시겠습니까?")) return;

        setSubmitting(true);
        try {
            const submitData: MbtiSubmitRequest = {
                answers: Object.entries(answers).map(([qid, cid]) => ({
                    questionId: Number(qid),
                    choiceId: cid
                }))
            };

            const res = await submitMbtiAnswers(submitData);

            // Backend returns MbtiResultResponse wrapped in ApiResponse
            if (res.data) {
                // 결과 바로 적용 (Reload 불필요)
                resultActions.setData(res.data);
                toast.success("MBTI 분석이 완료되었습니다.");
            } else {
                toast.error("제출 실패 (응답 확인 필요)");
            }

        } catch (e) {
            console.error(e);
            toast.error("제출 중 오류가 발생했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>MBTI 학습 성향 검사</h1>
            <p className={styles.description}>
                총 {questions.length}문항입니다. 솔직하게 답변해주세요.
            </p>

            <div className={styles.questionList}>
                {questions.map((q) => (
                    <div key={q.questionId} className={styles.questionItem}>
                        <div className={styles.questionText}>
                            Q. {q.content}
                        </div>
                        <div className={styles.choices}>
                            {q.choices.map((c) => (
                                <button
                                    key={c.choiceId}
                                    className={`${styles.choiceBtn} ${answers[q.questionId] === c.choiceId ? styles.selected : ""}`}
                                    onClick={() => handleSelect(q.questionId, c.choiceId)}
                                >
                                    {c.content}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.actionArea}>
                <Button
                    className={styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={submitting || questions.length === 0}
                    loading={submitting}
                >
                    결과 보기
                </Button>
            </div>
        </div>
    );
};

function ComparisonBar({ leftLabel, rightLabel, leftScore, rightScore, leftColor, rightColor, rowClass }:
    { leftLabel: string, rightLabel: string, leftScore: number, rightScore: number, leftColor: string, rightColor: string, rowClass?: string }) {

    // 점수 합계 (보통 100점 만점 기준이겠지만, 안전하게 계산)
    const total = (leftScore || 0) + (rightScore || 0) || 100;

    // 퍼센트 계산
    const leftPercent = Math.round(((leftScore || 0) / total) * 100);
    const rightPercent = 100 - leftPercent; // 나머지

    return (
        <div className={`${styles.chartRow} ${rowClass || ''}`}>
            <span className={`${styles.label} ${styles.left}`}>{leftLabel}</span>
            <div className={styles.barContainer}>
                <div
                    className={styles.barLeft}
                    style={{ width: `${leftPercent}%`, backgroundColor: leftColor }}
                >
                    {leftPercent > 10 && `${leftPercent}%`}
                </div>
                <div
                    className={styles.barRight}
                    style={{ width: `${rightPercent}%`, backgroundColor: rightColor }}
                >
                    {rightPercent > 10 && `${rightPercent}%`}
                </div>
            </div>
            <span className={`${styles.label} ${styles.right}`}>{rightLabel}</span>
        </div>
    );
}

