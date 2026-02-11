package com.teamlms.backend.domain.mbti.api.dto;

import com.teamlms.backend.domain.mbti.entity.MbtiQuestion;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class MbtiQuestionResponse {
    private Long questionId;
    private String content;
    private Integer sortOrder;
    private List<MbtiChoiceResponse> choices;

    @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    public static MbtiQuestionResponse from(MbtiQuestion question) {
        return MbtiQuestionResponse.builder()
                .questionId(question.getQuestionId())
                .content(question.getContent())
                .sortOrder(question.getSortOrder())
                .choices(question.getChoices().stream()
                        .map(MbtiChoiceResponse::from)
                        .collect(Collectors.toList()))
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }

    public static MbtiQuestionResponse from(com.teamlms.backend.domain.mbti.dto.MbtiQuestionDto dto) {
        return MbtiQuestionResponse.builder()
                .questionId(dto.getQuestionId())
                .content(dto.getContent())
                .sortOrder(dto.getSortOrder())
                .choices(dto.getChoices().stream()
                        .map(c -> MbtiChoiceResponse.builder()
                                .choiceId(c.getChoiceId())
                                .content(c.getContent())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
