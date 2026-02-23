package com.teamlms.backend.domain.extracurricular.api.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.*;

public record ExtraCurricularOfferingCreateRequest(

    @NotNull
    Long extraCurricularId,

    @NotBlank
    @Size(max = 50)
    String extraOfferingCode,

    @NotBlank
    @Size(max = 200)
    String extraOfferingName,

    @NotBlank
    @Size(max = 100)
    String hostContactName,

    @NotBlank
    @Size(max = 50)
    @Pattern(
        regexp = "^(01[016789]-?\\d{3,4}-?\\d{4}|0[2-9]-?\\d{3,4}-?\\d{4})$",
        message = "{validation.extraCurricular.hostContactPhone.pattern}"
    )
    String hostContactPhone,

    @NotBlank
    @Email
    @Size(max = 150)
    String hostContactEmail,

    @NotNull
    @Min(0)
    Long rewardPointDefault,

    @NotNull
    @Min(0)
    Long recognizedHoursDefault,

    @NotNull
    Long semesterId,

    @NotNull
    LocalDateTime operationStartAt,

    @NotNull
    LocalDateTime operationEndAt

) {}
