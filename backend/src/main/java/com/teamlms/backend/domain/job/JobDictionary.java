package com.teamlms.backend.domain.job;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_dictionary")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class JobDictionary {

    @Id
    @Column(name = "job_code", length = 20)
    private String jobCode; // 직업코드 (PK)

    @Column(nullable = false)
    private String jobTitle;

    @Column(columnDefinition = "TEXT")
    private String jobSummary;

    private String avgSalary; // 평균임금 (문자열로 오는 경우가 많음)
    private String prospects; // 전망

    @CreationTimestamp
    private LocalDateTime createdAt;
}