package com.teamlms.backend.domain.mbti.api.dto;

import com.teamlms.backend.domain.mbti.entity.MbtiChoice;

public record MbtiChoiceResponse(
        Long choiceId,
        String content
) {
    public static MbtiChoiceResponse from(MbtiChoice choice) {
        return new MbtiChoiceResponse(choice.getChoiceId(), choice.getContent());
    }
}
