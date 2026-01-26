package com.teamlms.backend.domain.study_rental.api.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

// 2. 학습공간 상세 조회용 (규칙 + 이미지 전체)
@Getter
@Builder
public class SpaceDetailResponse {
    private Long spaceId;
    private String spaceName;
    private String location;
    private String description;
    
    private Boolean isRentable;
    
    private List<ImageResponse> images;
    private List<RuleResponse> rules;

    @Getter @Builder
    public static class ImageResponse {
        private Long imageId;
        private String imageUrl;
        private Integer sortOrder;
    }

    @Getter @Builder
    public static class RuleResponse {
        private Long ruleId;
        private String content;
        private Integer sortOrder;
    }
}