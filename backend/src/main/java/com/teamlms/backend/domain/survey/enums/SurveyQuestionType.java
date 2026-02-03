package com.teamlms.backend.domain.survey.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum SurveyQuestionType {

    RATING("척도형 (점수 선택)"),
    SINGLE_CHOICE("객관식 (단일 선택)"),
    MULTIPLE_CHOICE("객관식 (다중 선택)"),
    ESSAY("주관식 (서술형)");

    private final String description;
}
