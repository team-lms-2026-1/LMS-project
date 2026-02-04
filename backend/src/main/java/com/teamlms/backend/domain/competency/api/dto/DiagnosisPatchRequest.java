package com.teamlms.backend.domain.competency.api.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import java.util.List;

@Getter
public class DiagnosisPatchRequest {

    private String title;
    private String status; // DRAFT, OPEN, CLOSED
    private LocalDateTime endedAt;
    private List<DiagnosisQuestionRequest> questions;
}
