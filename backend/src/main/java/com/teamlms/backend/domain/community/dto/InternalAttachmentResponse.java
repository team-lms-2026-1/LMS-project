package com.teamlms.backend.domain.community.dto;

// 첨부파일 위치 알기 위한 내부 DTO

import com.teamlms.backend.domain.community.entity.NoticeAttachment;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class InternalAttachmentResponse {
    private Long id;
    private String storageKey;
    private String originalName;
    private Long fileSize;
    // Audit Info (Custom Mapped)
    private LocalDateTime uploadedAt;
    private Long uploadedBy;
    private LocalDateTime updatedAt;
    private Long updatedBy;

    public InternalAttachmentResponse(NoticeAttachment entity) {
        this.id = entity.getId();
        this.storageKey = entity.getStorageKey();
        this.originalName = entity.getOriginalName();
        this.fileSize = entity.getFileSize();
        this.uploadedAt = entity.getUploadedAt();
        this.uploadedBy = entity.getUploadedBy();
        this.updatedAt = entity.getUpdatedAt();
        this.updatedBy = entity.getUpdatedBy();
    }
}