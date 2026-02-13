package com.teamlms.backend.domain.dept.api.dto;

import jakarta.validation.constraints.NotBlank;

public record MajorUpdateRequest(
    @NotBlank
    String majorName,
    
    @NotBlank
    String description,

    boolean isActive
) {}
