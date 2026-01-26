package com.teamlms.backend.domain.extracurricular.entity;

import java.time.LocalDateTime;

import com.teamlms.backend.global.audit.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "extra_curricular_application",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_extra_application",
            columnNames = {"extra_offering_id", "student_account_id"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtraCurricularApplication extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "application_id", nullable = false)
    private Long applicationId;

    @Column(name = "extra_offering_id", nullable = false)
    private Long extraOfferingId;

    @Column(name = "student_account_id", nullable = false)
    private Long studentAccountId;

    // DDL: applied_at TIMESTAMP NOT NULL DEFAULT now()
    @Column(name = "applied_at", nullable = false)
    private LocalDateTime appliedAt;
}
