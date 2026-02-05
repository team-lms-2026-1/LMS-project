package com.teamlms.backend.domain.extracurricular.api.dto;

import java.time.LocalDateTime;
import com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus;

public record ExtraCurricularOfferingBasicDetailResponse(

    Long extraOfferingId,
    Long extraCurricularId,

    // ✅ 비교과 마스터(ExtraCurricular) 정보
    String extraCurricularCode,
    String extraCurricularName,
    String hostOrgName,
    String description,

    // ✅ 운영(Offering)
    String extraOfferingCode,
    String extraOfferingName,

    Long enrolledCount,          // ✅ 등록인원 (신청/등록 수)

    String hostContactName,
    String hostContactPhone,
    String hostContactEmail,

    Long rewardPointDefault,
    Long recognizedHoursDefault,

    Long semesterId,
    String semesterDisplayName,

    LocalDateTime operationStartAt,
    LocalDateTime operationEndAt,

    ExtraOfferingStatus status
) {}
