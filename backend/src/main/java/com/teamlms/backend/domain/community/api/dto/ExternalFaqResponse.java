package com.teamlms.backend.domain.community.api.dto;

import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class ExternalFaqResponse {
    private Long faqId;
    private ExternalCategoryResponse category; // 공통 DTO 재사용
    private String title;
    private String content;
    private int viewCount;
    private String createdAt;
}