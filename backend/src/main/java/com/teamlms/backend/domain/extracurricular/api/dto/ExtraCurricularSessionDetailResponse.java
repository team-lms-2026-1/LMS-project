package com.teamlms.backend.domain.extracurricular.api.dto;

public record ExtraCurricularSessionDetailResponse(
    Long sessionId,
    Long extraOfferingId,
    String sessionName,
    String status,
    String startAt,
    String endAt,
    Long rewardPoint,
    Long recognizedHours,
    VideoDto video
) {
    public record VideoDto(
        Long videoId,
        String title,
        Long durationSeconds,
        String previewUrl
    ) {}
}
