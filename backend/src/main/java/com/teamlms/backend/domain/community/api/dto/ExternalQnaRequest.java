package com.teamlms.backend.domain.community.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor
public class ExternalQnaRequest {
    private Long categoryId;
    private String title;
    private String content;
}