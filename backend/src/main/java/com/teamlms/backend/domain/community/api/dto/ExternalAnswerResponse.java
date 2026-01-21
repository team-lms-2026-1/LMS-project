package com.teamlms.backend.domain.community.api.dto;

import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class ExternalAnswerResponse {
    private Long answerId;
    private String content;
    private String authorName;
    private String createdAt;
}