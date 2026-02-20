package com.teamlms.backend.domain.mbti.dto;

import com.teamlms.backend.domain.mbti.entity.MbtiQuestion;
import com.teamlms.backend.domain.mbti.enums.MbtiDimension;

import java.util.List;

public record MbtiQuestionDto(
        Long questionId,
        String content,
        MbtiDimension dimension,
        Integer sortOrder,
        List<MbtiChoiceDto> choices
) {
    public static MbtiQuestionDto from(MbtiQuestion question) {
        return new MbtiQuestionDto(
                question.getQuestionId(),
                question.getContent(),
                question.getDimension(),
                question.getSortOrder(),
                question.getChoices().stream().map(MbtiChoiceDto::from).toList()
        );
    }
}
