package com.teamlms.backend.domain.community.api.dto;

import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class ExternalQnaDetailResponse {
    private Long questionId;
    private ExternalCategoryResponse category;
    private String title;
    private String content;
    private int viewCount;
    private String authorName;
    private Long authorId;
    private String createdAt;
    private ExternalAnswerResponse answer;
}