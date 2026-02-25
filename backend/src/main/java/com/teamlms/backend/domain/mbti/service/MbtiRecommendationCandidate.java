package com.teamlms.backend.domain.mbti.service;

import com.teamlms.backend.domain.mbti.entity.JobCatalog;

import java.util.List;

public record MbtiRecommendationCandidate(JobCatalog job, int score, List<String> matchedKeywords) {
}
