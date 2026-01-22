package com.teamlms.backend.domain.community.dto;

import com.teamlms.backend.domain.community.entity.ResourceAttachment;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class InternalResourceAttachmentResponse {
    private Long id;
    private String storageKey;
    private String originalName;
    private Long fileSize;
    
    // Audit Info
    private LocalDateTime uploadedAt;
    private Long uploadedBy;
    private LocalDateTime updatedAt;
    private Long updatedBy;

    // ⚠️ 변경됨: 파라미터가 ResourceAttachment
    public InternalResourceAttachmentResponse(ResourceAttachment entity) {
        this.id = entity.getId();
        this.storageKey = entity.getStorageKey();
        this.originalName = entity.getOriginalName();
        this.fileSize = entity.getFileSize();
        // ResourceAttachment 엔티티는 @CreatedDate 등을 사용하므로 필드명 확인 필요
        // (앞서 작성한 Entity 기준으로는 uploadedAt 등의 매핑이 되어 있어야 합니다)
        this.uploadedAt = entity.getUploadedAt();
        this.uploadedBy = entity.getUploadedBy();
        this.updatedAt = entity.getUpdatedAt();
        this.updatedBy = entity.getUpdatedBy();
    }
}