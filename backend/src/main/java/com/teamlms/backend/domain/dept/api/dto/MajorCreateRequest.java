package com.teamlms.backend.domain.dept.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MajorCreateRequest {

    @NotBlank
    @Size(max = 30)
    private String majorCode;

    @NotBlank
    @Size(max = 100)
    private String majorName;

    @NotBlank
    private String description;

    @com.fasterxml.jackson.annotation.JsonProperty("isActive")
    private boolean isActive;
}
