package com.teamlms.backend.domain.community.api.dto;

import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class ExternalQnaResponse {
    private Long questionId;
    private ExternalCategoryResponse category;
    private String title;
    private int viewCount;
    private String authorName;
    private String createdAt;
    private boolean hasAnswer;
}