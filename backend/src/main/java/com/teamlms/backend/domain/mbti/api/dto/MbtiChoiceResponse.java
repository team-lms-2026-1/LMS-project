package com.teamlms.backend.domain.mbti.api.dto;

import com.teamlms.backend.domain.mbti.entity.MbtiChoice;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MbtiChoiceResponse {
    private Long choiceId;
    private String content;

    public static MbtiChoiceResponse from(MbtiChoice choice) {
        return MbtiChoiceResponse.builder()
                .choiceId(choice.getChoiceId())
                .content(choice.getContent())
                .build();
    }
}
