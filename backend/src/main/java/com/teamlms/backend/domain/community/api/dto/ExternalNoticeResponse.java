package com.teamlms.backend.domain.community.api.dto;
//공지사항
import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter @Builder
public class ExternalNoticeResponse {
    private Long noticeId;
    private String categoryName;
    private String title;
    private String content;
    private String authorName; 
    private int viewCount;
    private String createdAt;
    
    // 여기! 이 필드를 추가해야 .status()를 쓸 수 있습니다.
    private String status; 

    private List<ExternalAttachmentResponse> files;
}