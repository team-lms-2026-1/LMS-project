package com.teamlms.backend.domain.study_rental.entity;

import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
    name = "study_room",
    indexes = {
        @Index(name = "idx_study_room_unique_name", columnList = "space_id, room_name", unique = true),
        @Index(name = "idx_study_room_space_active", columnList = "space_id, is_active"),
        @Index(name = "idx_study_room_operation_dates", columnList = "operation_start_date, operation_end_date")
    }
)
public class StudyRoom extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "space_id", nullable = false)
    private StudySpace studySpace;

    @Column(name = "room_name", nullable = false)
    private String roomName;

    @Builder.Default
    @Column(name = "min_people", nullable = false)
    private Integer minPeople = 1;

    @Column(name = "max_people", nullable = false)
    private Integer maxPeople;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "operation_start_date", nullable = false)
    private LocalDate operationStartDate;

    @Column(name = "operation_end_date", nullable = false)
    private LocalDate operationEndDate;

    @Column(name = "rentable_start_time", nullable = false)
    private LocalTime rentableStartTime;

    @Column(name = "rentable_end_time", nullable = false)
    private LocalTime rentableEndTime;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public void update(String roomName, Integer minPeople, Integer maxPeople, String description,
                       LocalDate operationStartDate, LocalDate operationEndDate,
                       LocalTime rentableStartTime, LocalTime rentableEndTime) {
        this.roomName = roomName;
        this.minPeople = minPeople;
        this.maxPeople = maxPeople;
        this.description = description;
        this.operationStartDate = operationStartDate;
        this.operationEndDate = operationEndDate;
        this.rentableStartTime = rentableStartTime;
        this.rentableEndTime = rentableEndTime;
    }
}