package com.teamlms.backend.domain.mbti.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.teamlms.backend.domain.mbti.dto.MbtiQuestionDto;
import com.teamlms.backend.domain.mbti.entity.MbtiQuestion;
import com.teamlms.backend.domain.mbti.service.MbtiI18nService;

import java.time.LocalDateTime;
import java.util.List;

public record MbtiQuestionResponse(
        Long questionId,
        String content,
        Integer sortOrder,
        List<MbtiChoiceResponse> choices,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime updatedAt
) {
    public static MbtiQuestionResponse from(MbtiQuestion question) {
        return new MbtiQuestionResponse(
                question.getQuestionId(),
                question.getContent(),
                question.getSortOrder(),
                question.getChoices().stream().map(MbtiChoiceResponse::from).toList(),
                question.getCreatedAt(),
                question.getUpdatedAt()
        );
    }

    /**
     * 다국어 지원 버전 - locale에 맞는 내용 반환
     */
    public static MbtiQuestionResponse fromWithI18n(
            MbtiQuestion question,
            String locale,
            MbtiI18nService i18nService) {
        return new MbtiQuestionResponse(
                question.getQuestionId(),
                i18nService.getQuestionContent(question, locale),
                question.getSortOrder(),
                question.getChoices().stream()
                        .map(choice -> MbtiChoiceResponse.fromWithI18n(choice, locale, i18nService))
                        .toList(),
                question.getCreatedAt(),
                question.getUpdatedAt()
        );
    }

    public static MbtiQuestionResponse from(MbtiQuestionDto dto) {
        return new MbtiQuestionResponse(
                dto.questionId(),
                dto.content(),
                dto.sortOrder(),
                dto.choices().stream()
                        .map(c -> new MbtiChoiceResponse(c.choiceId(), c.content()))
                        .toList(),
                null,
                null
        );
    }
}

