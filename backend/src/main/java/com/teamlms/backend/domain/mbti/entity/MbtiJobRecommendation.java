package com.teamlms.backend.domain.mbti.entity;

import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "mbti_job_recommendation")
public class MbtiJobRecommendation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recommendation_id")
    private Long recommendationId;

    @Column(name = "account_id", nullable = false, unique = true)
    private Long accountId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mbti_result_id", nullable = false)
    private MbtiResult mbtiResult;

    @Column(name = "mbti_type", nullable = false, length = 10)
    private String mbtiType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "selected_keyword_ids_json", nullable = false, columnDefinition = "jsonb")
    private List<Long> selectedKeywordIds;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "candidate_job_codes_json", nullable = false, columnDefinition = "jsonb")
    private List<String> candidateJobCodes;

    @Column(name = "model_name", nullable = false, length = 100)
    private String modelName;

    @Column(name = "prompt_version", nullable = false, length = 40)
    private String promptVersion;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    @OrderBy("rankNo ASC")
    @OneToMany(mappedBy = "recommendation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MbtiJobRecommendationItem> items = new ArrayList<>();

    @Builder
    private MbtiJobRecommendation(
            Long accountId,
            MbtiResult mbtiResult,
            String mbtiType,
            List<Long> selectedKeywordIds,
            List<String> candidateJobCodes,
            String modelName,
            String promptVersion,
            LocalDateTime generatedAt
    ) {
        this.accountId = accountId;
        this.mbtiResult = mbtiResult;
        this.mbtiType = mbtiType;
        this.selectedKeywordIds = selectedKeywordIds;
        this.candidateJobCodes = candidateJobCodes;
        this.modelName = modelName;
        this.promptVersion = promptVersion;
        this.generatedAt = generatedAt;
    }

    public static MbtiJobRecommendation create(
            Long accountId,
            MbtiResult mbtiResult,
            List<Long> selectedKeywordIds,
            List<String> candidateJobCodes,
            String modelName,
            String promptVersion,
            LocalDateTime generatedAt
    ) {
        return MbtiJobRecommendation.builder()
                .accountId(accountId)
                .mbtiResult(mbtiResult)
                .mbtiType(mbtiResult.getMbtiType())
                .selectedKeywordIds(new ArrayList<>(selectedKeywordIds))
                .candidateJobCodes(new ArrayList<>(candidateJobCodes))
                .modelName(modelName)
                .promptVersion(promptVersion)
                .generatedAt(generatedAt)
                .build();
    }

    public void updateGenerated(
            MbtiResult mbtiResult,
            List<Long> selectedKeywordIds,
            List<String> candidateJobCodes,
            String modelName,
            String promptVersion,
            LocalDateTime generatedAt
    ) {
        this.mbtiResult = mbtiResult;
        this.mbtiType = mbtiResult.getMbtiType();
        this.selectedKeywordIds = new ArrayList<>(selectedKeywordIds);
        this.candidateJobCodes = new ArrayList<>(candidateJobCodes);
        this.modelName = modelName;
        this.promptVersion = promptVersion;
        this.generatedAt = generatedAt;
    }

    public void replaceItems(List<MbtiJobRecommendationItem> newItems) {
        this.items.clear();
        this.items.addAll(newItems);
    }
}
