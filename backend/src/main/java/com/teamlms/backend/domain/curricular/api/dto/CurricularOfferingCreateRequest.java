package com.teamlms.backend.domain.curricular.api.dto;



import com.teamlms.backend.domain.curricular.enums.DayOfWeekType;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class CurricularOfferingCreateRequest {
    
    @NotBlank
    @Size(max = 50)
    private String offeringCode;

    @NotNull
    private Long curricularId;

    @NotNull
    private Long semesterId;

    @NotNull
    private DayOfWeekType dayOfWeek;

    @NotNull
    @Min(1)
    @Max(6)
    private Integer period;

    @NotNull
    @Min(1)
    private Integer capacity;

    @NotBlank
    @Size(max = 255)
    private String location;

    @NotNull
    private Long professorAccountId;
}
