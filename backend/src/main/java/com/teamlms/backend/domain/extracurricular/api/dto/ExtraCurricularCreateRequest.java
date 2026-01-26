package com.teamlms.backend.domain.extracurricular.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class ExtraCurricularCreateRequest {
    
    @NotBlank
    @Size(max = 50)
    private String extraCurricularCode;

    @NotBlank
    @Size(max = 200)
    private String extraCurricularName;

    private String description;

    @NotNull
    private String hostOrgName;

}
