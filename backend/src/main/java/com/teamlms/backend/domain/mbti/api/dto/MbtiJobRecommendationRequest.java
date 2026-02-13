package com.teamlms.backend.domain.mbti.api.dto;

import java.util.List;

public record MbtiJobRecommendationRequest(
        List<Long> keywordIds
) {
}
