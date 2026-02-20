package com.teamlms.backend.domain.curricular.api.dto;

import com.teamlms.backend.domain.curricular.enums.DayOfWeekType;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CurricularOfferingCreateRequest(
    @NotBlank
    @Size(max = 50)
    String offeringCode,

    @NotNull
    Long curricularId,

    @NotNull
    Long semesterId,

    @NotNull
    DayOfWeekType dayOfWeek,

    @NotNull
    @Min(1)
    @Max(6)
    Integer period,

    @NotNull
    @Min(1)
    Integer capacity,

    @NotBlank
    @Size(max = 255)
    String location,

    @NotNull
    Long professorAccountId
) {
}
