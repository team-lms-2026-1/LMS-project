package com.teamlms.backend.domain.community.dto;

import com.teamlms.backend.domain.community.entity.ResourceCategory;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class InternalResourceCategoryResponse {
    private Long id;
    private String name;
    private String bgColorHex;
    private String textColorHex;
    
    // Audit Info
    private Long createdBy;
    private LocalDateTime createdAt;
    private Long updatedBy;
    private LocalDateTime updatedAt;

    // ⚠️ 변경됨: 파라미터가 ResourceCategory
    public InternalResourceCategoryResponse(ResourceCategory entity) {
        this.id = entity.getId();
        this.name = entity.getName();
        this.bgColorHex = entity.getBgColorHex();
        this.textColorHex = entity.getTextColorHex();
        this.createdBy = entity.getCreatedBy();
        this.createdAt = entity.getCreatedAt();
        this.updatedBy = entity.getUpdatedBy();
        this.updatedAt = entity.getUpdatedAt();
    }
}