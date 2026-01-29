package com.teamlms.backend.domain.survey.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum SurveyType {
    SATISFACTION("만족도 조사"),
    COURSE("수강 설문"),
    SERVICE("서비스 이용 조사"),
    ETC("기타");

    private final String description;
}