package com.teamlms.backend.domain.mbti.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.teamlms.backend.domain.mbti.dto.MbtiResultDto;
import com.teamlms.backend.domain.mbti.entity.MbtiResult;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MbtiResultResponse {
    private Long resultId;
    private Long accountId;
    private String mbtiType; // e.g., "ENTJ"
    private MbtiScore score;

    @JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @Getter
    @Builder
    public static class MbtiScore {
        private int e;
        private int i;
        private int s;
        private int n;
        private int t;
        private int f;
        private int j;
        private int p;
    }

    public static MbtiResultResponse from(MbtiResult result) {
        return MbtiResultResponse.builder()
                .resultId(result.getResultId())
                .accountId(result.getAccountId())
                .mbtiType(result.getMbtiType())
                .score(MbtiScore.builder()
                        .e(result.getEScore())
                        .i(result.getIScore())
                        .s(result.getSScore())
                        .n(result.getNScore())
                        .t(result.getTScore())
                        .f(result.getFScore())
                        .j(result.getJScore())
                        .p(result.getPScore())
                        .build())
                .createdAt(result.getCreatedAt())
                .build();
    }

    public static MbtiResultResponse from(MbtiResultDto dto) {
        return MbtiResultResponse.builder()
                .resultId(dto.getResultId())
                .accountId(dto.getAccountId())
                .mbtiType(dto.getMbtiType())
                .score(MbtiScore.builder()
                        .e(dto.getEScore())
                        .i(dto.getIScore())
                        .s(dto.getSScore())
                        .n(dto.getNScore())
                        .t(dto.getTScore())
                        .f(dto.getFScore())
                        .j(dto.getJScore())
                        .p(dto.getPScore())
                        .build())
                .createdAt(dto.getCreatedAt())
                .build();
    }
}
