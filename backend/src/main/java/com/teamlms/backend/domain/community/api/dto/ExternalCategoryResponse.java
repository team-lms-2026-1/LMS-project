package com.teamlms.backend.domain.community.api.dto;

// BFF가 색상 코드나 이름을 보낼 때 유효성 검사를 수행하는 dto
// 카테고리 
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter @Builder @AllArgsConstructor
public class ExternalCategoryResponse {
    private Long categoryId;
    private String name;
    private String bgColorHex;
    private String textColorHex;
}