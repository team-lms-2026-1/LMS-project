package com.teamlms.backend.domain.mbti.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.teamlms.backend.domain.mbti.dto.MbtiResultDto;
import com.teamlms.backend.domain.mbti.entity.MbtiResult;

import java.time.LocalDateTime;

public record MbtiResultResponse(
        Long resultId,
        Long accountId,
        String mbtiType,
        MbtiScore score,
        @JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt
) {
    public record MbtiScore(
            int e,
            int i,
            int s,
            int n,
            int t,
            int f,
            int j,
            int p
    ) {
    }

    public static MbtiResultResponse from(MbtiResult result) {
        return new MbtiResultResponse(
                result.getResultId(),
                result.getAccountId(),
                result.getMbtiType(),
                new MbtiScore(
                        result.getEScore(),
                        result.getIScore(),
                        result.getSScore(),
                        result.getNScore(),
                        result.getTScore(),
                        result.getFScore(),
                        result.getJScore(),
                        result.getPScore()
                ),
                result.getCreatedAt()
        );
    }

    public static MbtiResultResponse from(MbtiResultDto dto) {
        return new MbtiResultResponse(
                dto.resultId(),
                dto.accountId(),
                dto.mbtiType(),
                new MbtiScore(
                        dto.eScore(),
                        dto.iScore(),
                        dto.sScore(),
                        dto.nScore(),
                        dto.tScore(),
                        dto.fScore(),
                        dto.jScore(),
                        dto.pScore()
                ),
                dto.createdAt()
        );
    }
}
