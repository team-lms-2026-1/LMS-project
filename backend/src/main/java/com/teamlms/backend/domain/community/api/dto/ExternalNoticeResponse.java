package com.teamlms.backend.domain.community.api.dto;
//공지사항
import lombok.Builder;
import lombok.Getter;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter @Builder
@AllArgsConstructor @NoArgsConstructor
public class ExternalNoticeResponse {
    private Long noticeId;
    private CategoryInfo category; // String categoryName 대신 객체로 변경
    private String title;
    private String content;
    private String authorName;
    private Integer viewCount;
    private String createdAt;
    private String status;
    private List<ExternalAttachmentResponse> files;

    @Getter @Builder
    public static class CategoryInfo {
        private Long categoryId;
        private String name;
        private String bgColorHex;
        private String textColorHex;
    }
}