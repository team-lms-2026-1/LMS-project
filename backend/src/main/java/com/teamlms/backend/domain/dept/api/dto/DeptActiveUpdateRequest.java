package com.teamlms.backend.domain.dept.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DeptActiveUpdateRequest(
    @JsonProperty("isActive") boolean isActive
) {}
