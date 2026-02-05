package com.teamlms.backend.domain.extracurricular.api.dto;

import jakarta.validation.constraints.*;

public record ExtraSessionVideoCreateRequest(

    @NotBlank
    @Size(max = 500)
    String storageKey,

    @NotBlank
    @Size(max = 200)
    String title,

    @NotNull
    @Min(1)
    Integer durationSeconds
) {}
