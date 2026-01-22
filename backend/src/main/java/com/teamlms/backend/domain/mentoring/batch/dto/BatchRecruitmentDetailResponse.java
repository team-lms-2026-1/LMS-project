package com.teamlms.backend.domain.mentoring.batch.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record BatchRecruitmentDetailResponse(
        Map<String, Object> recruitment,
        List<Map<String, Object>> mentors,
        List<Map<String, Object>> mentees,
        Map<String, Object> counts
) {
    public static Map<String, Object> recruitmentInfo(Long recruitmentId, Long semesterId, Integer year, String term,
                                                      String title, LocalDateTime startAt, LocalDateTime endAt, String status) {
        return Map.of(
                "recruitmentId", recruitmentId,
                "semesterId", semesterId,
                "year", year,
                "term", term,
                "title", title,
                "recruitmentStartAt", startAt,
                "recruitmentEndAt", endAt,
                "status", status
        );
    }
}
