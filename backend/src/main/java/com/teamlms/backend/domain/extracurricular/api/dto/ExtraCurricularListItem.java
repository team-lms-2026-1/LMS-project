package com.teamlms.backend.domain.extracurricular.api.dto;

import java.time.LocalDateTime;

public record ExtraCurricularListItem(
    Long extraCurricularId,
    String extraCurricularCode,
    String extraCurricularName,
    String hostOrgName,
    Boolean isActive,
    
    LocalDateTime createdAt
) {}
