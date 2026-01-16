package com.teamlms.backend.domain.community.dto;
// 내부에서 카테고리 검색 할 때 사용
import com.teamlms.backend.domain.community.entity.NoticeCategory;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class InternalCategoryResponse {
    private Long id;
    private String name;
    private String bgColorHex;
    private String textColorHex;
    // Audit Info
    private Long createdBy;
    private LocalDateTime createdAt;
    private Long updatedBy;
    private LocalDateTime updatedAt;

    public InternalCategoryResponse(NoticeCategory entity) {
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