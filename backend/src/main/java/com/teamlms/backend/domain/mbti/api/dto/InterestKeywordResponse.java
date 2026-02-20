package com.teamlms.backend.domain.mbti.api.dto;

import com.teamlms.backend.domain.mbti.entity.InterestKeywordMaster;
import com.teamlms.backend.domain.mbti.service.MbtiI18nService;

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

    /**
     * 다국어 지원 버전 - locale에 맞는 내용 반환
     */
    public static InterestKeywordResponse fromWithI18n(
            InterestKeywordMaster keyword,
            String locale,
            MbtiI18nService i18nService) {
        return new InterestKeywordResponse(
                keyword.getId(),
                i18nService.getKeyword(keyword, locale),
                i18nService.getKeywordCategory(keyword, locale),
                keyword.getSortOrder()
        );
    }
}
