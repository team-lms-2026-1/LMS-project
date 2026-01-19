package com.teamlms.backend.domain.community.dto;
//공지사항
import com.teamlms.backend.domain.community.entity.Notice;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class InternalNoticeResponse {
    private Long id;
    private Long categoryId;
    private String title;
    private String content;
    private int viewCount;
    private Long authorId; // 표시용 작성자 ID
    

    // Audit Info
    private Long createdBy; // 실제 DB 입력자 ID
    private LocalDateTime createdAt;
    private Long updatedBy;
    private LocalDateTime updatedAt;

    public InternalNoticeResponse(Notice entity) {
        this.id = entity.getId();
        this.categoryId = entity.getCategory().getId();
        this.title = entity.getTitle();
        this.content = entity.getContent();
        this.viewCount = entity.getViewCount();
        this.authorId = entity.getAuthor().getAccountId(); // Account ID 확인 필요

        this.createdBy = entity.getCreatedBy();
        this.createdAt = entity.getCreatedAt();
        this.updatedBy = entity.getUpdatedBy();
        this.updatedAt = entity.getUpdatedAt();
    }
}