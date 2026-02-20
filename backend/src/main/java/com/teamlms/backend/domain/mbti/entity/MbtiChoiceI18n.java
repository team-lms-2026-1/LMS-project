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
    name = "mbti_choice_i18n",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_mbti_choice_locale",
        columnNames = {"choice_id", "locale"}
    ),
    indexes = @Index(
        name = "idx_mbti_choice_i18n_locale",
        columnList = "choice_id,locale"
    )
)
public class MbtiChoiceI18n extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "choice_id", nullable = false)
    private MbtiChoice choice;

    @Column(nullable = false, length = 10)
    private String locale;  // ko, en, ja

    @Column(nullable = false, length = 255)
    private String content;
}
