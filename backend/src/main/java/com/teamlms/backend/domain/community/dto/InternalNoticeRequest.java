package com.teamlms.backend.domain.community.dto;
//공지사항
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter @Builder
public class InternalNoticeRequest {
    private Long categoryId;
    private String titleKeyword;
    private String contentKeyword;
    private Long authorId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}