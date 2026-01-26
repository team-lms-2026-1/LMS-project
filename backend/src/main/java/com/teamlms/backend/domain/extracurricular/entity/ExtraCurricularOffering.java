package com.teamlms.backend.domain.extracurricular.entity;

import java.time.LocalDateTime;

import com.teamlms.backend.domain.curricular.enums.DayOfWeekType;
import com.teamlms.backend.domain.curricular.enums.OfferingStatus;
import com.teamlms.backend.domain.extracurricular.enums.ExtraOfferingStatus;
import com.teamlms.backend.global.audit.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(
    name = "extra_curricular_offering",
    indexes = {
        @Index(name = "idx_extra_curricular_offering_curricular_id", columnList = "extra_curricular_id"),
        @Index(name = "idx_extra_curricular_offering_semester_id", columnList = "semester_id"),
    }
)
public class ExtraCurricularOffering extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "offering_id")
    private Long extraOfferingId;

    @Column(name = "extra_curricular_id", nullable = false)
    private Long extraCurricularId;

    @Column(name = "extra_offering_code", length = 50, nullable = false)
    private String extraOfferingCode;

    @Column(name = "extra_offering_name", length = 200, nullable = false)
    private String extraOfferingName;

    @Column(name = "host_contact_name", length = 100, nullable = false)
    private String hostContactName;

    @Column(name = "host_contact_phone", length = 50, nullable = false)
    private String hostContactPhone;

    @Column(name = "host_contact_email", length = 150, nullable = false)
    private String hostContactEmail;

    @Column(name = "reward_point_default", nullable = false)
    private Long rewardPointDefault;

    @Column(name = "recognized_hours_default", nullable = false)
    private Long recognizedHoursDefault;

    @Column(name = "semester_id", nullable = false)
    private Long semesterId;

    @Column(name = "operation_start_at", nullable = false)
    private LocalDateTime operationStartAt;

    @Column(name = "operation_end_at", nullable = false)
    private LocalDateTime operationEndAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    private ExtraOfferingStatus status; // DRAFT, OPEN, ENROLLMENT_CLOSED, IN_PROGRESS, COMPLETED, CANCELED

    // domain method
    public void patchForDraft(
        String extraOfferingCode,
        String extraOfferingName,

        String hostContactName,
        String hostContactPhone,
        String hostContactEmail,

        Long rewardPointDefault,
        Long recognizedHoursDefault,

        Long semesterId,

        LocalDateTime operationStartAt,
        LocalDateTime operationEndAt
    ) {
        if (extraOfferingCode != null) this.extraOfferingCode = extraOfferingCode;
        if (extraOfferingName != null) this.extraOfferingName = extraOfferingName;

        if (hostContactName != null) this.hostContactName = hostContactName;
        if (hostContactPhone != null) this.hostContactPhone = hostContactPhone;
        if (hostContactEmail != null) this.hostContactEmail = hostContactEmail;

        if (rewardPointDefault != null) this.rewardPointDefault = rewardPointDefault;
        if (recognizedHoursDefault != null) this.recognizedHoursDefault = recognizedHoursDefault;

        if (semesterId != null) this.semesterId = semesterId;

        if (operationStartAt != null) this.operationStartAt = operationStartAt;
        if (operationEndAt != null) this.operationEndAt = operationEndAt;
    }

    public void changeStatus(ExtraOfferingStatus status) {
        this.status = status;
    }
}
