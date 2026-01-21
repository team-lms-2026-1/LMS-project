package com.teamlms.backend.domain.community.dto;

import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class InternalResourceSearchRequest {
    private Long categoryId; // 특정 카테고리 필터링 (없으면 null)
    private String keyword;  // 제목+내용 검색어 (없으면 null)
}