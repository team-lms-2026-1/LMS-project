package com.teamlms.backend.domain.survey.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.teamlms.backend.domain.survey.api.dto.SurveyCreateRequest.QuestionDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
public class SurveyUpdateRequest {
    @NotBlank
    private String title;

    private String description;

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime startAt;

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime endAt;

    // 질문 목록을 아예 새로 받아와서 교체하는 방식 (간편함)
    @NotNull(message = "질문 목록은 필수입니다")
    @NotEmpty(message = "질문을 하나 이상 추가해주세요")
    @Valid
    private List<QuestionDto> questions;
}