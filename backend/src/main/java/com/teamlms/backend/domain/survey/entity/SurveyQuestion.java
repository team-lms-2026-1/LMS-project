package com.teamlms.backend.domain.survey.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "survey_question", indexes = @Index(name = "idx_question_order", columnList = "survey_id, sort_order"))
public class SurveyQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Long id;

    // 연관관계 매핑 없이 ID만 참조 (ID-only Strategy)
    @Column(name = "survey_id", nullable = false)
    private Long surveyId;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    // 척도 (Scale) 설정
    @Builder.Default
    @Column(name = "min_val", nullable = false)
    private Integer minVal = 1;

    @Builder.Default
    @Column(name = "max_val", nullable = false)
    private Integer maxVal = 5;

    @Column(name = "min_label")
    private String minLabel;

    @Column(name = "max_label")
    private String maxLabel;

    // [New] Question Type
    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    private com.teamlms.backend.domain.survey.enums.SurveyQuestionType questionType;

    // [New] Options for Multiple Choice (Stored as JSON/Text)
    // MySQL/PostgreSQL compatibility advice: Use TEXT or JSON column.
    // Here we use simple formatting or assume converting to JSON string in service
    // layer if needed.
    // implementation simplification: Store as comma-separated or JSON string.
    // Ideally use @JdbcTypeCode(SqlTypes.JSON) like SurveyTarget, but let's check
    // needed dependencies.
    // We already saw @JdbcTypeCode used in SurveyTarget, so we can use it here too.

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "options_json", columnDefinition = "jsonb")
    private java.util.List<String> options;

    @Builder.Default
    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = true;
}