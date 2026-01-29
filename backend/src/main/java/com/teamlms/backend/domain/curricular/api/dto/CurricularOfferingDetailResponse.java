package com.teamlms.backend.domain.curricular.api.dto;

import com.teamlms.backend.domain.curricular.enums.DayOfWeekType;
import com.teamlms.backend.domain.curricular.enums.OfferingStatus;

public record CurricularOfferingDetailResponse(

    Long offeringId,
    String offeringCode,

    Long curricularId,
    String curricularName,
    Integer credits,
    String description,

    Long deptId,
    String deptName,

    Long semesterId,
    String semesterName,   // 2026-1, 2026-s

    Long professorAccountId,
    String professorName,
    String email,
    String phone,

    DayOfWeekType dayOfWeek,
    Integer period,

    Integer capacity,
    Long enrolledCount,
    
    String location,

    OfferingStatus status
) {}
