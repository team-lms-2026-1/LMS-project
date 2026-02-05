package com.teamlms.backend.domain.competency.api.dto;

import java.time.LocalDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import java.util.List;

@Getter
public class DiagnosisCreateRequest {

    @NotBlank
    @Size(max = 255)
    private String title;

    @NotNull
    private Long semesterId;

    @NotNull
    @Min(1)
    @Max(6)
    private Integer targetGrade;

    private Long deptId;

    @NotNull
    private LocalDateTime startedAt;

    @NotNull
    private LocalDateTime endedAt;

    @NotNull
    @Size(min = 1)
    private List<DiagnosisQuestionRequest> questions;
}
