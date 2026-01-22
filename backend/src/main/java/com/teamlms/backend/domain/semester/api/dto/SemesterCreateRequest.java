package com.teamlms.backend.domain.semester.api.dto;

import java.time.LocalDate;

import com.teamlms.backend.domain.semester.enums.Term;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SemesterCreateRequest(

    @Positive int year,
    @NotNull Term term,
    LocalDate startDate,
    LocalDate endDate
) {}
