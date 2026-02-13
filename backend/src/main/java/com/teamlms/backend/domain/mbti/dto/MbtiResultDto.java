package com.teamlms.backend.domain.mbti.dto;

import com.teamlms.backend.domain.mbti.entity.MbtiResult;

import java.time.LocalDateTime;

public record MbtiResultDto(
        Long resultId,
        Long accountId,
        String mbtiType,
        int eScore,
        int iScore,
        int sScore,
        int nScore,
        int tScore,
        int fScore,
        int jScore,
        int pScore,
        LocalDateTime createdAt
) {
    public static MbtiResultDto from(MbtiResult result) {
        return new MbtiResultDto(
                result.getResultId(),
                result.getAccountId(),
                result.getMbtiType(),
                result.getEScore(),
                result.getIScore(),
                result.getSScore(),
                result.getNScore(),
                result.getTScore(),
                result.getFScore(),
                result.getJScore(),
                result.getPScore(),
                result.getCreatedAt()
        );
    }
}
