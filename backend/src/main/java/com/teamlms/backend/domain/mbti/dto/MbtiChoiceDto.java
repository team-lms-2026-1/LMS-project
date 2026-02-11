package com.teamlms.backend.domain.mbti.dto;

import com.teamlms.backend.domain.mbti.entity.MbtiChoice;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MbtiChoiceDto {
    private Long choiceId;
    private String content;
    private Integer scoreA;
    private Integer scoreB;

    public static MbtiChoiceDto from(MbtiChoice choice) {
        return MbtiChoiceDto.builder()
                .choiceId(choice.getChoiceId())
                .content(choice.getContent())
                .scoreA(choice.getScoreA())
                .scoreB(choice.getScoreB())
                .build();
    }
}
