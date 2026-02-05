package com.teamlms.backend.domain.extracurricular.api.dto;

import com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus;

public record ExtraCurricularOfferingListItem(

    Long extraOfferingId,

    String extraOfferingCode,
    String extraOfferingName,

    String hostContactName,       // 주관기관
    Long rewardPointDefault,      // 포인트
    Long recognizedHoursDefault,  // 인정시간

    ExtraOfferingStatus status
) {}
