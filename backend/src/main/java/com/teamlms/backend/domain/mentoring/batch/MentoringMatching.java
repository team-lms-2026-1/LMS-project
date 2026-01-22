package com.teamlms.backend.domain.mentoring.batch;

import com.teamlms.backend.domain.mentoring.application.MentoringApplication;
import com.teamlms.backend.domain.mentoring.recruitment.MentoringRecruitment;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mentoring_matching",
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_matching_unique_pair", columnNames = {"recruitment_id","mentee_application_id","mentor_application_id"})
       })
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor @Builder
public class MentoringMatching {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recruitment_id")
    private MentoringRecruitment recruitment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mentor_application_id")
    private MentoringApplication mentorApplication;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mentee_application_id")
    private MentoringApplication menteeApplication;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
