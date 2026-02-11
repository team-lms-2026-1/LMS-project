"use client";

import React from "react";
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import { useMbti } from "../hooks/useMbti";
import { MbtiTest } from "./MbtiTest";
import { MbtiResultView } from "./MbtiResultView";

export const MbtiContainer = () => {
    const { questions, result, loading, error, submit, retest } = useMbti();

    if (loading && !questions.length && !result) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: "lg", mx: "auto", py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    AI 어드바이져
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    MBTI 기반 직업 추천 및 성향 분석 서비스입니다.
                </Typography>
            </Box>

            {error ? (
                <Alert severity="error">{error}</Alert>
            ) : result ? (
                <MbtiResultView result={result} onRetest={retest} />
            ) : (
                <MbtiTest questions={questions} onSubmit={submit} />
            )}
        </Box>
    );
};
