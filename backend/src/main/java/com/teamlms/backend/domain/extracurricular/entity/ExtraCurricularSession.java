package com.teamlms.backend.domain.extracurricular.entity;

import java.time.LocalDateTime;

import com.teamlms.backend.domain.extracurricular.enums.ExtraSessionStatus;
import com.teamlms.backend.global.audit.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "extra_curricular_session",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_extra_session_offering_name",
            columnNames = {"extra_offering_id", "session_name"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtraCurricularSession extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id", nullable = false)
    private Long sessionId;

    @Column(name = "extra_offering_id", nullable = false)
    private Long extraOfferingId;

    @Column(name = "session_name", nullable = false, length = 100)
    private String sessionName;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ExtraSessionStatus status;

    @Column(name = "reward_point", nullable = false)
    private Long rewardPoint;

    @Column(name = "recognized_hours", nullable = false)
    private Long recognizedHours;
}
