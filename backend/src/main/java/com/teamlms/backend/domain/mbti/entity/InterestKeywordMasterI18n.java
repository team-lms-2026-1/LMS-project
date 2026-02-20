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
    name = "interest_keyword_master_i18n",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_interest_keyword_locale",
        columnNames = {"keyword_id", "locale"}
    ),
    indexes = {
        @Index(
            name = "idx_interest_keyword_i18n_locale",
            columnList = "keyword_id,locale"
        ),
        @Index(
            name = "idx_interest_keyword_i18n_keyword",
            columnList = "keyword"
        )
    }
)
public class InterestKeywordMasterI18n extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "keyword_id", nullable = false)
    private InterestKeywordMaster interestKeywordMaster;

    @Column(nullable = false, length = 10)
    private String locale;  // ko, en, ja

    @Column(nullable = false, length = 100)
    private String keyword;

    @Column(length = 50)
    private String category;  // 업무영역 / 업무방식 / 역량
}
