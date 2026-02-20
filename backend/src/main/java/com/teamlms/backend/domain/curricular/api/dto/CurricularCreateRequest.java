package com.teamlms.backend.domain.curricular.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CurricularCreateRequest(
    @NotBlank
    @Size(max = 50)
    String curricularCode,

    @NotBlank
    @Size(max = 200)
    String curricularName,

    @NotNull
    Long deptId,

    @NotNull
    @Min(0)
    Integer credits,

    String description
) {
}
