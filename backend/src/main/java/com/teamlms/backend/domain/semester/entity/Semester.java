package com.teamlms.backend.domain.semester.entity;

import java.time.LocalDate;

import com.teamlms.backend.domain.semester.enums.SemesterStatus;
import com.teamlms.backend.domain.semester.enums.Term;
import com.teamlms.backend.global.audit.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "semester")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Semester extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "semester_id")
    private Long semesterId;

    @Column(name = "year", nullable = false)
    private int year;

    @Enumerated(EnumType.STRING)
    @Column(name = "term", nullable = false, length = 20)
    private Term term;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SemesterStatus status;

    /* ========= domain method ========= */

    public static Semester planned (int year, Term term, LocalDate startDate, LocalDate endDate) {
        return Semester.builder()
                .year(year)
                .term(term)
                .startDate(startDate)
                .endDate(endDate)
                .status(SemesterStatus.PLANNED)
                .build();
    }

    public void patch(LocalDate startDate, LocalDate endDate, SemesterStatus status) {
        if (startDate != null) this.startDate = startDate;
        if (endDate != null) this.endDate = endDate;
        if (status != null) this.status = status;
    }
}
