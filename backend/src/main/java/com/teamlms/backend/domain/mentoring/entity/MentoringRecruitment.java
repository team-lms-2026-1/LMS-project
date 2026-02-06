package com.teamlms.backend.domain.mentoring.entity;

import com.teamlms.backend.domain.mentoring.enums.MentoringRecruitmentStatus;
import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mentoring_recruitment")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class MentoringRecruitment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recruitment_id")
    private Long recruitmentId;

    @Column(name = "semester_id", nullable = false)
    private Long semesterId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "recruit_start_at", nullable = false)
    private LocalDateTime recruitStartAt;

    @Column(name = "recruit_end_at", nullable = false)
    private LocalDateTime recruitEndAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private MentoringRecruitmentStatus status;

    public void update(Long semesterId, String title, String description,
            LocalDateTime recruitStartAt, LocalDateTime recruitEndAt,
            MentoringRecruitmentStatus status) {
        this.semesterId = semesterId;
        this.title = title;
        this.description = description;
        this.recruitStartAt = recruitStartAt;
        this.recruitEndAt = recruitEndAt;
        this.status = status;
    }
}
