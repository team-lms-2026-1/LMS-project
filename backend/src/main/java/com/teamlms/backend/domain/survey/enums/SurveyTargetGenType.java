package com.teamlms.backend.domain.survey.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum SurveyTargetGenType {
    ALL("전체 학생"),
    DEPT("학과별"),
    GRADE("학년별"),
    DEPT_GRADE("학과+학년"),
    USER("개별 선택");

    private final String description;
}
