package com.teamlms.backend.domain.mentoring.entity;

import com.teamlms.backend.domain.mentoring.enums.MentoringMatchingStatus;
import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mentoring_matching")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class MentoringMatching extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "matching_id")
    private Long matchingId;

    @Column(name = "recruitment_id", nullable = false)
    private Long recruitmentId;

    @Column(name = "mentor_application_id", nullable = false)
    private Long mentorApplicationId;

    @Column(name = "mentee_application_id", nullable = false)
    private Long menteeApplicationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private MentoringMatchingStatus status;

    @Column(name = "matched_at", nullable = false)
    private LocalDateTime matchedAt;

    @Column(name = "matched_by")
    private Long matchedBy;
}
