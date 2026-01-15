package com.teamlms.backend.domain.job;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_postings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class JobPosting {

    @Id
    @Column(name = "posting_id", length = 50)
    private String postingId; // wantedAuthNo (PK)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "biz_no")
    private Company company; // 기업 FK

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_code")
    private JobDictionary jobDictionary; // 직업 FK

    @Column(nullable = false)
    private String title;

    private String salaryType;   // 월급/연봉
    private String salaryAmount; // 급여 금액
    private String workRegion;   // 근무 지역
    private String minEducation; // 학력

    private LocalDate regDate;
    private LocalDate closeDate;

    @Column(nullable = false)
    private boolean isActive;

    @Column(columnDefinition = "TEXT")
    private String detailUrl;

    private LocalDateTime crawledAt;
}