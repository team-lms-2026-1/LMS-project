package com.teamlms.backend.domain.competency.entitiy;

import com.teamlms.backend.domain.competency.enums.DiagnosisQuestionDomain;
import com.teamlms.backend.domain.competency.enums.DiagnosisQuestionType;
import com.teamlms.backend.global.audit.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "diagnosis_question")
public class DiagnosisQuestion extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Long questionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "run_id", nullable = false)
    private DiagnosisRun run;

    @Enumerated(EnumType.STRING)
    @Column(name = "domain", nullable = false, length = 20)
    private DiagnosisQuestionDomain domain;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false, length = 20)
    private DiagnosisQuestionType questionType;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "section_title")
    private String sectionTitle; // 문제 그룹 제목

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "short_answer_key")
    private String shortAnswerKey;

    @Builder.Default
    @Column(name = "c1_max_score", nullable = false)
    private Integer c1MaxScore = 0;

    @Builder.Default
    @Column(name = "c2_max_score", nullable = false)
    private Integer c2MaxScore = 0;

    @Builder.Default
    @Column(name = "c3_max_score", nullable = false)
    private Integer c3MaxScore = 0;

    @Builder.Default
    @Column(name = "c4_max_score", nullable = false)
    private Integer c4MaxScore = 0;

    @Builder.Default
    @Column(name = "c5_max_score", nullable = false)
    private Integer c5MaxScore = 0;

    @Builder.Default
    @Column(name = "c6_max_score", nullable = false)
    private Integer c6MaxScore = 0;

    // --- 객관식 선택지 및 점수 ---
    @Column(name = "label1")
    private String label1;
    @Column(name = "label2")
    private String label2;
    @Column(name = "label3")
    private String label3;
    @Column(name = "label4")
    private String label4;
    @Column(name = "label5")
    private String label5;

    @Column(name = "score1")
    private Integer score1;
    @Column(name = "score2")
    private Integer score2;
    @Column(name = "score3")
    private Integer score3;
    @Column(name = "score4")
    private Integer score4;
    @Column(name = "score5")
    private Integer score5;
}
