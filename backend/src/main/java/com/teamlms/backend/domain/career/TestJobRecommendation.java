package com.teamlms.backend.domain.career;

import com.teamlms.backend.domain.job.JobDictionary;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "test_job_recommendations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class TestJobRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long recommendId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "history_id")
    private UserTestHistory userTestHistory;

    // 추천된 직업이 워크넷 직업사전에 있다면 연결 (Optional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_code")
    private JobDictionary jobDictionary;

    private String jobName; // 커리어넷에서 준 직업명
    private Integer rankOrder; // 추천 순위
}