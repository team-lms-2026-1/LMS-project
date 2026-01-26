package com.teamlms.backend.domain.study_rental.dto;

import lombok.Builder;
import lombok.Getter;

// 1. 학습공간 검색 조건 (Repository 전달용)
@Getter
@Builder
public class SpaceSearchCondition {
    private String keyword;       // 공간명 or 위치
    private Boolean isActiveOnly; // 학생: true, 관리자: false(전체)
}