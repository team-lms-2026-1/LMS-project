package com.teamlms.backend.domain.curricular.api.dto;

import com.teamlms.backend.domain.curricular.enums.OfferingStatus;

public record CurricularOfferingListItem(
        Long offeringId,
        String offeringCode,
        String curricularName,
        Integer capacity,
        String professorName,
        String semesterName,   // 2026-1, 2026-s
        String location,
        Integer credit,
        OfferingStatus status
) {}
