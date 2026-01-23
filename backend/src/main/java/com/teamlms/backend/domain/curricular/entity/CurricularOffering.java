package com.teamlms.backend.domain.curricular.entity;

import com.teamlms.backend.domain.curricular.enums.DayOfWeekType;
import com.teamlms.backend.domain.curricular.enums.OfferingStatus;
import com.teamlms.backend.global.audit.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(
    name = "curricular_offering",
    indexes = {
        @Index(name = "idx_curricular_offering_curricular_id", columnList = "curricular_id"),
        @Index(name = "idx_curricular_offering_semester_id", columnList = "semester_id"),
        @Index(name = "idx_curricular_offering_professor_account_id", columnList = "professor_account_id")
    }
)
public class CurricularOffering extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "offering_id")
    private Long offeringId;

    @Column(name = "offering_code", length = 50, nullable = false)
    private String offeringCode;

    @Column(name = "curricular_id", nullable = false)
    private Long curricularId;

    @Column(name = "semester_id", nullable = false)
    private Long semesterId;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", length = 20, nullable = false)
    private DayOfWeekType dayOfWeek;

    @Column(name = "period", nullable = false)
    private Integer period; // 1~6 교시

    @Column(name = "capacity", nullable = false)  // 최대 수강 인원
    private Integer capacity;

    @Column(name = "location", length = 255, nullable = false)
    private String location;

    @Column(name = "professor_account_id", nullable = false)
    private Long professorAccountId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    private OfferingStatus status; // DRAFT, OPEN, ENROLLMENT_CLOSED, IN_PROGRESS, COMPLETED, CANCELED

    // domain method
    public void patchForDraft(
        String offeringCode,
        Long semesterId,
        DayOfWeekType dayOfWeek,
        Integer period,
        Integer capacity,
        String location,
        Long professorAccountId
    ) {
        if (offeringCode != null) this.offeringCode = offeringCode;
        if (semesterId != null) this.semesterId = semesterId;
        if (dayOfWeek != null) this.dayOfWeek = dayOfWeek;
        if (period != null) this.period = period;
        if (capacity != null) this.capacity = capacity;
        if (location != null) this.location = location;
        if (professorAccountId != null) this.professorAccountId = professorAccountId;
    }

    public void changeStatus(OfferingStatus status) {
        this.status = status;
    }
}
