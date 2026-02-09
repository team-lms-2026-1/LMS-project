package com.teamlms.backend.domain.extracurricular.api.dto;

import java.time.LocalDateTime;

import com.teamlms.backend.domain.extracurricular.enums.ExtraSessionStatus;

public record AdminExtraCurricularSessionDetailRow(
    Long sessionId,
    Long extraOfferingId,
    String sessionName,
    LocalDateTime startAt,
    LocalDateTime endAt,
    Long rewardPoint,
    Long recognizedHours,
    ExtraSessionStatus status,
    Long videoId,
    String videoTitle,
    String storageKey,
    Integer durationSeconds
) {}
