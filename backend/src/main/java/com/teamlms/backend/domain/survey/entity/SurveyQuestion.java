package com.teamlms.backend.domain.survey.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
    name = "survey_question",
    indexes = @Index(name = "idx_question_order", columnList = "survey_id, sort_order")
)
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

    @Builder.Default
    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = true;
}