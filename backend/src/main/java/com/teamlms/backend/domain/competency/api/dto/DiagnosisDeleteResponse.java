package com.teamlms.backend.domain.competency.api.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DiagnosisDeleteResponse {
    private Long deletedId;
    private String result;
}
