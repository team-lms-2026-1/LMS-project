package com.teamlms.backend.domain.community.dto;

import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class InternalFaqSearchRequest {
    private Long categoryId;
    private String keyword;
}