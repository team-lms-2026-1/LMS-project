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
    name = "job_catalog_i18n",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_job_catalog_locale",
        columnNames = {"job_id", "locale"}
    ),
    indexes = {
        @Index(
            name = "idx_job_catalog_i18n_locale",
            columnList = "job_id,locale"
        ),
        @Index(
            name = "idx_job_catalog_i18n_search_text",
            columnList = "search_text"
        )
    }
)
public class JobCatalogI18n extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private JobCatalog jobCatalog;

    @Column(nullable = false, length = 10)
    private String locale;  // ko, en, ja

    @Column(nullable = false, length = 300)
    private String jobName;

    @Column(length = 200)
    private String majorName;

    @Column(length = 200)
    private String middleName;

    @Column(length = 200)
    private String minorName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String searchText;
}
