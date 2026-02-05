package com.teamlms.backend.domain.extracurricular.api.dto;

import java.time.LocalDateTime;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

public record ExtraCurricularSessionCreateRequest(

    @NotBlank
    @Size(max = 100)
    String sessionName,

    @NotNull
    LocalDateTime startAt,

    @NotNull
    LocalDateTime endAt,

    @NotNull
    @Min(0)
    Long rewardPoint,

    @NotNull
    @Min(0)
    Long recognizedHours,

    @NotNull
    @Valid
    ExtraSessionVideoCreateRequest video
) {}
