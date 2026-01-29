package com.teamlms.backend.domain.survey.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum SurveyTargetStatus {
    PENDING("미참여"),
    IN_PROGRESS("진행 중"), // (임시 저장 기능이 있다면 사용)
    SUBMITTED("제출 완료");

    private final String description;
}