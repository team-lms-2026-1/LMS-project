package com.teamlms.backend.domain.mbti.api.dto;

import com.teamlms.backend.domain.mbti.entity.InterestKeywordMaster;

public record InterestKeywordResponse(
        Long id,
        String keyword,
        String category,
        Integer sortOrder
) {
    public static InterestKeywordResponse from(InterestKeywordMaster keyword) {
        return new InterestKeywordResponse(
                keyword.getId(),
                keyword.getKeyword(),
                keyword.getCategory(),
                keyword.getSortOrder()
        );
    }
}
