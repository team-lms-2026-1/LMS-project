package com.teamlms.backend.domain.community.api.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter @Builder
public class ExternalResourceResponse {

    private Long resourceId;
    
    // 공통 DTO 재사용 (중첩 객체로 반환)
    private ExternalCategoryResponse category;

    private String title;
    private String content;
    private String authorName; // 작성자 이름
    private int viewCount;
    private String createdAt;  // yyyy-MM-dd HH:mm 포맷

    // 공통 DTO 재사용 (첨부파일 목록)
    private List<ExternalAttachmentResponse> files;
}