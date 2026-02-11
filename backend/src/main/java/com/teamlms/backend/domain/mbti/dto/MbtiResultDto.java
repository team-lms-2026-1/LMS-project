package com.teamlms.backend.domain.mbti.dto;

import com.teamlms.backend.domain.mbti.entity.MbtiResult;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MbtiResultDto {
    private Long resultId;
    private Long accountId;
    private String mbtiType;
    private int eScore;
    private int iScore;
    private int sScore;
    private int nScore;
    private int tScore;
    private int fScore;
    private int jScore;
    private int pScore;
    private LocalDateTime createdAt;

    public static MbtiResultDto from(MbtiResult result) {
        return MbtiResultDto.builder()
                .resultId(result.getResultId())
                .accountId(result.getAccountId())
                .mbtiType(result.getMbtiType())
                .eScore(result.getEScore())
                .iScore(result.getIScore())
                .sScore(result.getSScore())
                .nScore(result.getNScore())
                .tScore(result.getTScore())
                .fScore(result.getFScore())
                .jScore(result.getJScore())
                .pScore(result.getPScore())
                .createdAt(result.getCreatedAt())
                .build();
    }
}
