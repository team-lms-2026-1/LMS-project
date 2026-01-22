package com.teamlms.backend.domain.semester.api.dto;

import java.time.LocalDate;

import com.teamlms.backend.domain.semester.entity.Semester;
import com.teamlms.backend.domain.semester.enums.SemesterStatus;
import com.teamlms.backend.domain.semester.enums.Term;

public record SemesterListItem(
    Long semesterId,
    int year,
    Term term,
    LocalDate startDate,
    LocalDate endDate,
    SemesterStatus status
) {
    public static SemesterListItem from(Semester s) {
        return new SemesterListItem(
            s.getSemesterId(),
            s.getYear(),
            s.getTerm(),
            s.getStartDate(),
            s.getEndDate(),
            s.getStatus()
        );
    }
}
