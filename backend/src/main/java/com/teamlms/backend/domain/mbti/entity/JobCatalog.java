package com.teamlms.backend.domain.mbti.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "job_catalog")
public class JobCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String version;

    @Column(name = "job_code", nullable = false, length = 20)
    private String jobCode;

    @Column(name = "major_name", length = 200)
    private String majorName;

    @Column(name = "middle_name", length = 200)
    private String middleName;

    @Column(name = "minor_name", length = 200)
    private String minorName;

    @Column(name = "job_name", nullable = false, length = 300)
    private String jobName;

    @Column(name = "search_text", nullable = false, columnDefinition = "text")
    private String searchText;

    @Builder.Default
    @OneToMany(mappedBy = "jobCatalog", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<JobCatalogI18n> i18nContents = new ArrayList<>();

    /**
     * 주어진 locale에 해당하는 다국어 직업명 조회
     * @param locale locale code (ko, en, ja)
     * @return locale에 해당하는 직업명, 없으면 기본 jobName 반환
     */
    public String getJobNameByLocale(String locale) {
        return i18nContents.stream()
            .filter(i18n -> i18n.getLocale().equals(locale))
            .map(JobCatalogI18n::getJobName)
            .findFirst()
            .orElse(this.jobName);
    }
}
