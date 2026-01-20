package com.teamlms.backend.domain.community.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter @NoArgsConstructor
public class ExternalResourcePatchRequest {

    // Validation 어노테이션 없음 (Null 허용)
    private Long categoryId;
    private String title;
    private String content;

    // 삭제할 첨부파일 ID 목록 (선택 사항)
    private List<Long> deleteFileIds;
}