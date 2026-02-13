package com.teamlms.backend.domain.mbti.api.dto;

import java.time.LocalDateTime;
import java.util.List;

public record MbtiJobRecommendationResponse(
        Long recommendationId,
        Long mbtiResultId,
        String mbtiType,
        List<SelectedKeyword> selectedKeywords,
        List<RecommendedJob> recommendations,
        LocalDateTime generatedAt
) {
    public record SelectedKeyword(
            Long id,
            String keyword,
            String category
    ) {
    }

    public record RecommendedJob(
            Integer rank,
            Long jobCatalogId,
            String jobCode,
            String jobName,
            String reason
    ) {
    }
}
