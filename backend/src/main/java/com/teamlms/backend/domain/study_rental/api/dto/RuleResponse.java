package com.teamlms.backend.domain.study_rental.api.dto;

import lombok.Builder;
import lombok.Getter;

// 4. 하위 정보 응답들
@Getter
@Builder
public class RuleResponse {
    private Long ruleId;
    private String content;
    private Integer sortOrder;
}