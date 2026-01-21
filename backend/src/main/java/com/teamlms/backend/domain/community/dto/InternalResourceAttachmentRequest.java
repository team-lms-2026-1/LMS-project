package com.teamlms.backend.domain.community.dto;

import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class InternalResourceAttachmentRequest {
    // ⚠️ 변경됨: noticeId -> resourceId
    private Long resourceId; 
    
    private String storageKey;
    private String originalName;
    private String contentType;
    private Long fileSize;
}