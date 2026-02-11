package com.teamlms.backend.domain.mbti.dto;

import com.teamlms.backend.domain.mbti.entity.MbtiQuestion;
import com.teamlms.backend.domain.mbti.enums.MbtiDimension;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class MbtiQuestionDto {
    private Long questionId;
    private String content;
    private MbtiDimension dimension;
    private Integer sortOrder;
    private List<MbtiChoiceDto> choices;

    public static MbtiQuestionDto from(MbtiQuestion question) {
        return MbtiQuestionDto.builder()
                .questionId(question.getQuestionId())
                .content(question.getContent())
                .dimension(question.getDimension())
                .sortOrder(question.getSortOrder())
                .choices(question.getChoices().stream()
                        .map(MbtiChoiceDto::from)
                        .collect(Collectors.toList()))
                .build();
    }
}
