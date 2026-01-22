package com.teamlms.backend.domain.community.dto;

// 첨부파일 위치 알기 위한 내부 DTO
import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class InternalAttachmentRequest {
    private Long noticeId;
    private String storageKey;
    private String originalName;
    private String contentType;
    private Long fileSize;
}