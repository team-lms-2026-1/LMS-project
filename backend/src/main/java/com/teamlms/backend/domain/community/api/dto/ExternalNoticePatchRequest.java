package com.teamlms.backend.domain.community.api.dto;

//공지사항
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter @NoArgsConstructor
public class ExternalNoticePatchRequest {
    // PATCH용이므로 @NotNull, @NotBlank를 모두 제거합니다.
    // 값이 있으면 수정하고, null이면 기존 값을 유지하는 방식입니다.
    
    private Long categoryId;
    private String title;
    private String content;
    private String displayStartAt;
    private String displayEndAt;

    //삭제할 첨부파일 ID 목록 (선택 사항)
    private List<Long> deleteFileIds;
}