package com.teamlms.backend.domain.community.api.dto;
//공지사항
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor
public class ExternalNoticeRequest {
    @NotNull
    private Long categoryId;
    @NotBlank
    private String title;
    @NotBlank
    private String content;
    private String displayStartAt; // ISO-8601 String
    private String displayEndAt;
}