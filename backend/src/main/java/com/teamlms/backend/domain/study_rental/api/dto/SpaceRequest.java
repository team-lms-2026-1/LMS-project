package com.teamlms.backend.domain.study_rental.api.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

// 1. 학습공간 생성/수정 요청
// (이미지는 MultipartFile로 별도 처리하므로 여기선 메타데이터만 받음)
@Getter
@NoArgsConstructor
public class SpaceRequest {
    @NotBlank(message = "공간 이름은 필수입니다.")
    private String spaceName;

    @NotBlank(message = "위치 정보는 필수입니다.")
    private String location;

    private String description;

    // 규칙(Rule) 리스트 (수정 시 교체 방식)
    private List<RuleRequest> rules;

    @Getter
    @NoArgsConstructor
    public static class RuleRequest {
        @NotBlank
        private String content;
        private Integer sortOrder;
    }
}