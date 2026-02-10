package com.teamlms.backend.domain.competency.api.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosisPatchRequest {

    private String title;
    private String status; // DRAFT, OPEN, CLOSED
    private LocalDateTime endedAt;
    private List<DiagnosisProblemRequest> problems;
    private List<DiagnosisQuestionRequest> questions;
}
