package com.teamlms.backend.domain.community.api.dto;

import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class ExternalAttachmentResponse {
    private Long attachmentId;
    private String originalName;
    private String contentType;
    private Long fileSize;
    private String uploadedAt;  // 포맷팅된 날짜
    private String downloadUrl; // 다운로드 링크
}