package com.teamlms.backend.domain.curricular.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class CurricularCreateRequest {

    @NotBlank
    @Size(max = 50)
    private String curricularCode;

    @NotBlank
    @Size(max = 200)
    private String curricularName;

    @NotNull
    private Long deptId;

    @NotNull
    @Min(0)
    private Integer credits;

    private String description;
}
