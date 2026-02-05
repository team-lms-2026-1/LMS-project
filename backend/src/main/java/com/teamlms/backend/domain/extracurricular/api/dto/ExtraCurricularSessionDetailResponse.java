package com.teamlms.backend.domain.extracurricular.api.dto;

import java.time.LocalDateTime;

import com.teamlms.backend.domain.extracurricular.enums.ExtraSessionStatus;

public record ExtraCurricularSessionDetailResponse(

    Long sessionId,
    Long extraOfferingId,

    String sessionName,
    LocalDateTime startAt,
    LocalDateTime endAt,

    Long rewardPoint,
    Long recognizedHours,

    ExtraSessionStatus status,

    // video (1:1 필수)
    Long videoId,
    String videoTitle,
    String storageKey,
    Integer durationSeconds
) {}
