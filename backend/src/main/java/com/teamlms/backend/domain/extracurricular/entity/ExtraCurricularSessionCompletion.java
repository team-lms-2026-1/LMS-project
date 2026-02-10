package com.teamlms.backend.domain.extracurricular.entity;

import java.time.LocalDateTime;

import com.teamlms.backend.global.audit.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "extra_curricular_session_completion",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_extra_completion",
            columnNames = {"session_id", "application_id"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtraCurricularSessionCompletion extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "completion_id", nullable = false)
    private Long completionId;

    @Column(name = "session_id", nullable = false)
    private Long sessionId;

    @Column(name = "application_id", nullable = false)
    private Long applicationId;

    @Column(name = "is_attended", nullable = false)
    private Boolean isAttended;

    @Column(name = "attended_at")
    private LocalDateTime attendedAt;

    @Column(name = "earned_point", nullable = false)
    private Long earnedPoint;

    @Column(name = "earned_hours", nullable = false)
    private Long earnedHours;

    @Column(name = "watched_seconds", nullable = false)
    private Integer watchedSeconds;
}
