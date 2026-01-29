package com.teamlms.backend.domain.survey.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum SurveyStatus {
    DRAFT("작성 중"),
    OPEN("진행 중"),
    CLOSED("종료됨");

    private final String description;
}