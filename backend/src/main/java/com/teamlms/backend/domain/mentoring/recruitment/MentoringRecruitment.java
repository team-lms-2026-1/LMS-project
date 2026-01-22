package com.teamlms.backend.domain.mentoring.recruitment;

import com.teamlms.backend.domain.mentoring.semester.Semester;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mentoring_recruitment")
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor @Builder
public class MentoringRecruitment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "semester_id")
    private Semester semester;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false, length = 10)
    private String term;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    @Column(nullable = false)
    private String description; // html

    @Column(nullable = false)
    private LocalDateTime recruitmentStartAt;

    @Column(nullable = false)
    private LocalDateTime recruitmentEndAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RecruitmentStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public void update(String title, String description, LocalDateTime startAt, LocalDateTime endAt) {
        this.title = title;
        this.description = description;
        this.recruitmentStartAt = startAt;
        this.recruitmentEndAt = endAt;
    }
}
