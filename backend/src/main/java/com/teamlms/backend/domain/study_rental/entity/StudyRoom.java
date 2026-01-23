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
        @Index(name = "idx_study_room_unique_name", columnList = "space_id, room_name", unique = true)
    }
)
public class StudyRoom extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long id;

    @Column(name = "space_id", nullable = false)
    private Long spaceId;

    @Column(name = "room_name", nullable = false)
    private String roomName;

    @Column(name = "min_people", nullable = false)
    private Integer minPeople;

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

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
}