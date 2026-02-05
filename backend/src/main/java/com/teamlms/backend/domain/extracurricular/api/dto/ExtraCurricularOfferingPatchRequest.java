package com.teamlms.backend.domain.extracurricular.api.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record ExtraCurricularOfferingPatchRequest(

    @Size(max = 50)
    String extraOfferingCode,

    @Size(max = 200)
    String extraOfferingName,

    @Size(max = 100)
    String hostContactName,

    @Size(max = 50)
    String hostContactPhone,

    @Email
    @Size(max = 150)
    String hostContactEmail,

    @Min(0)
    Long rewardPointDefault,

    @Min(0)
    Long recognizedHoursDefault,

    Long semesterId,

    LocalDateTime operationStartAt,
    LocalDateTime operationEndAt

) {}
