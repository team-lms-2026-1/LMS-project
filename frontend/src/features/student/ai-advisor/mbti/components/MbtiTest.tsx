import React, { useState } from "react";
import { Box, Typography, Paper, RadioGroup, FormControlLabel, Radio, LinearProgress, Stack } from "@mui/material";
import { Button } from "@/components/button/Button";
import { MbtiQuestion } from "../api/types";

interface MbtiTestProps {
    questions: MbtiQuestion[];
    onSubmit: (answers: Record<number, number>) => void;
}

export const MbtiTest: React.FC<MbtiTestProps> = ({ questions, onSubmit }) => {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [currentPage, setCurrentPage] = useState(0);
    const QUESTIONS_PER_PAGE = 5;

    const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
    const currentQuestions = questions.slice(currentPage * QUESTIONS_PER_PAGE, (currentPage + 1) * QUESTIONS_PER_PAGE);

    const progress = ((Object.keys(answers).length) / questions.length) * 100;

    const handleAnswerChange = (questionId: number, choiceId: number) => {
        setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
    };

    const isPageComplete = currentQuestions.every((q) => answers[q.questionId] !== undefined);

    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage((prev) => prev + 1);
            window.scrollTo(0, 0);
        } else {
            onSubmit(answers);
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) {
            setCurrentPage((prev) => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}>
                MBTI 진단 테스트
            </Typography>

            <Box sx={{ mb: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: "right" }}>
                    진행률 {Math.round(progress)}%
                </Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
            </Box>

            <Stack spacing={4}>
                {currentQuestions.map((q, index) => (
                    <Paper key={q.questionId} elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            {currentPage * QUESTIONS_PER_PAGE + index + 1}. {q.content}
                        </Typography>
                        <RadioGroup
                            value={answers[q.questionId] ?? ""}
                            onChange={(e) => handleAnswerChange(q.questionId, Number(e.target.value))}
                        >
                            <Stack spacing={1}>
                                {q.choices.map((c) => (
                                    <FormControlLabel
                                        key={c.choiceId}
                                        value={c.choiceId}
                                        control={<Radio />}
                                        label={c.content}
                                        sx={{
                                            p: 1,
                                            borderRadius: 1,
                                            "&:hover": { bgcolor: "action.hover" },
                                            ...(answers[q.questionId] === c.choiceId && { bgcolor: "primary.lighter" }),
                                        }}
                                    />
                                ))}
                            </Stack>
                        </RadioGroup>
                    </Paper>
                ))}
            </Stack>

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 6 }}>
                <Button
                    variant="secondary"
                    onClick={handlePrev}
                    disabled={currentPage === 0}
                >
                    이전
                </Button>
                <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={!isPageComplete}
                >
                    {currentPage === totalPages - 1 ? "제출하기" : "다음"}
                </Button>
            </Box>
        </Box>
    );
};
