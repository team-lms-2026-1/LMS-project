package com.teamlms.backend.domain.mbti.entity;

import com.teamlms.backend.global.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
    name = "mbti_question_i18n",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_mbti_question_locale",
        columnNames = {"question_id", "locale"}
    ),
    indexes = @Index(
        name = "idx_mbti_question_i18n_locale",
        columnList = "question_id,locale"
    )
)
public class MbtiQuestionI18n extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private MbtiQuestion question;

    @Column(nullable = false, length = 10)
    private String locale;  // ko, en, ja

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
}
