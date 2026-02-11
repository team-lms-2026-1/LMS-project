import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { Button } from "@/components/button/Button";
import { MbtiResult } from "../api/types";

interface MbtiResultProps {
    result: MbtiResult;
    onRetest: () => void;
}

export const MbtiResultView: React.FC<MbtiResultProps> = ({ result, onRetest }) => {
    return (
        <Box sx={{ maxWidth: 800, mx: "auto", p: 3, textAlign: "center" }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
                나의 MBTI 유형은?
            </Typography>

            <Paper elevation={3} sx={{ p: 6, mb: 4, borderRadius: 4, bgcolor: "primary.light", color: "white" }}>
                <Typography variant="h2" sx={{ fontWeight: "bold", mb: 2 }}>
                    {result.mbtiType}
                </Typography>
                <Typography variant="h6">
                    당신에게 딱 맞는 커리어를 추천해드릴 수 있습니다.
                </Typography>
            </Paper>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 2, mb: 6 }}>
                <ScoreCard label="E (외향)" score={result.score.e} total={result.score.e + result.score.i} />
                <ScoreCard label="I (내향)" score={result.score.i} total={result.score.e + result.score.i} />
                <ScoreCard label="S (감각)" score={result.score.s} total={result.score.s + result.score.n} />
                <ScoreCard label="N (직관)" score={result.score.n} total={result.score.s + result.score.n} />
                <ScoreCard label="T (사고)" score={result.score.t} total={result.score.t + result.score.f} />
                <ScoreCard label="F (감정)" score={result.score.f} total={result.score.t + result.score.f} />
                <ScoreCard label="J (판단)" score={result.score.j} total={result.score.j + result.score.p} />
                <ScoreCard label="P (인식)" score={result.score.p} total={result.score.j + result.score.p} />
            </Box>

            <Box sx={{ textAlign: "center" }}>
                <Button variant="secondary" onClick={onRetest}>
                    다시 검사하기
                </Button>
            </Box>
        </Box>
    );
};

const ScoreCard = ({ label, score, total }: { label: string; score: number; total: number }) => {
    const safeTotal = total === 0 ? 1 : total;
    const percentage = Math.round((score / safeTotal) * 100);

    return (
        <Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="subtitle1" fontWeight="bold">{label}</Typography>
            <Typography variant="h4" color="primary">{percentage}%</Typography>
        </Paper>
    );
}
