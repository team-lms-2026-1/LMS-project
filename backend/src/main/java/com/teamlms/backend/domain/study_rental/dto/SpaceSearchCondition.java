package com.teamlms.backend.domain.study_rental.dto;

import lombok.Builder;
import lombok.Getter;

// 2. 공간 검색 조건
@Getter
@Builder
public class SpaceSearchCondition {
    private String keyword;  // 이름 검색
    private String location; // 지역 검색
    private Boolean isActiveOnly;
}