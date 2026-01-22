package com.teamlms.backend.domain.semester.api.dto;

import java.time.LocalDate;

import com.teamlms.backend.domain.semester.entity.Semester;
import com.teamlms.backend.domain.semester.enums.SemesterStatus;
import com.teamlms.backend.domain.semester.enums.Term;

public record SemesterEditFormResponse(
    Long semesterId,
    int year,
    Term term,
    LocalDate  startDate,
    LocalDate endDate,
    SemesterStatus status
) {
    public static SemesterEditFormResponse from(Semester s){
        return new SemesterEditFormResponse(
            s.getSemesterId(),
            s.getYear(),
            s.getTerm(),
            s.getStartDate(),
            s.getEndDate(),
            s.getStatus()
        );
    }    
}
