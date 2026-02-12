package com.teamlms.backend.domain.mbti.entity;

import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "mbti_job_recommendation_item")
public class MbtiJobRecommendationItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommendation_id", nullable = false)
    private MbtiJobRecommendation recommendation;

    @Column(name = "rank_no", nullable = false)
    private Integer rankNo;

    @Column(name = "job_catalog_id", nullable = false)
    private Long jobCatalogId;

    @Column(name = "job_code", nullable = false, length = 20)
    private String jobCode;

    @Column(name = "job_name", nullable = false, length = 300)
    private String jobName;

    @Column(name = "reason_text", nullable = false, columnDefinition = "text")
    private String reasonText;

    @Builder
    private MbtiJobRecommendationItem(
            MbtiJobRecommendation recommendation,
            Integer rankNo,
            Long jobCatalogId,
            String jobCode,
            String jobName,
            String reasonText
    ) {
        this.recommendation = recommendation;
        this.rankNo = rankNo;
        this.jobCatalogId = jobCatalogId;
        this.jobCode = jobCode;
        this.jobName = jobName;
        this.reasonText = reasonText;
    }
}
