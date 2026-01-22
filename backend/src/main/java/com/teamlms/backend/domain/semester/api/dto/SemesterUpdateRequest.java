package com.teamlms.backend.domain.semester.api.dto;

import java.time.LocalDate;

import com.teamlms.backend.domain.semester.enums.SemesterStatus;

public record SemesterUpdateRequest(
    LocalDate startDate,
    LocalDate endDate,
    SemesterStatus status
) {}
