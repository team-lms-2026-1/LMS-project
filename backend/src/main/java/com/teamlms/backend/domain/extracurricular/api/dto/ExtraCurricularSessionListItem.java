package com.teamlms.backend.domain.extracurricular.api.dto;

import java.time.LocalDateTime;

import com.teamlms.backend.domain.extracurricular.enums.ExtraSessionStatus;

public record ExtraCurricularSessionListItem(

    Long sessionId,
    String sessionName,

    LocalDateTime startAt,
    LocalDateTime endAt,

    Long rewardPoint,
    Long recognizedHours,

    ExtraSessionStatus status,

    // video
    Long videoId,
    String videoTitle,
    Integer durationSeconds
) {}
