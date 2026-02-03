package com.teamlms.backend.domain.survey.entity;

import com.teamlms.backend.domain.survey.enums.SurveyTargetStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "survey_target", indexes = {
        @Index(name = "idx_target_user", columnList = "target_account_id, status"),
        @Index(name = "idx_target_unique", columnList = "survey_id, target_account_id", unique = true)
})
public class SurveyTarget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "target_id")
    private Long id;

    @Column(name = "survey_id", nullable = false)
    private Long surveyId;

    @Column(name = "target_account_id", nullable = false)
    private Long targetAccountId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SurveyTargetStatus status;

    @Column(name = "invited_at", nullable = false)
    private LocalDateTime invitedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    // ✅ 응답 데이터: Map<문항ID(String), 점수(Integer)>

    // DB에는 JSONB(PostgreSQL) 또는 JSON(MySQL) 타입으로 저장됨
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "response_json", columnDefinition = "jsonb")
    private Map<String, Object> responseJson;

    // 응답 제출 처리 메서드
    public void submit(Map<String, Object> responses) {
        this.responseJson = responses;
        this.status = SurveyTargetStatus.SUBMITTED;
        this.submittedAt = LocalDateTime.now();
    }
}