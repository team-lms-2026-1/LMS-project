package com.teamlms.backend.domain.mbti.dto;

import com.teamlms.backend.domain.mbti.entity.MbtiChoice;

public record MbtiChoiceDto(
        Long choiceId,
        String content,
        Integer scoreA,
        Integer scoreB
) {
    public static MbtiChoiceDto from(MbtiChoice choice) {
        return new MbtiChoiceDto(
                choice.getChoiceId(),
                choice.getContent(),
                choice.getScoreA(),
                choice.getScoreB()
        );
    }
}
