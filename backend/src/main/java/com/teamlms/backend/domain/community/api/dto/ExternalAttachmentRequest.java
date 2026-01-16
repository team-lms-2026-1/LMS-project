package com.teamlms.backend.domain.community.api.dto;
//첨부파일
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor
public class ExternalAttachmentRequest {
    private Long attachmentId;
    private String newFileName;
}