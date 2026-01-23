package com.teamlms.backend.domain.curricular.api.dto;

import com.teamlms.backend.domain.curricular.enums.DayOfWeekType;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record CurricularOfferingUpdateRequest(

    @Size(max = 50)
    String offeringCode,

    Long semesterId,

    DayOfWeekType dayOfWeek,

    @Min(1)
    @Max(6)
    Integer period,

    @Min(1)
    Integer capacity,

    String location,

    Long professorAccountId
) {}
