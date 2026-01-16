package com.teamlms.backend.domain.community.dto;
// 내부에서 카테고리 검색 할 때 사용
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class InternalCategoryRequest {
    private String searchName;
}