package com.teamlms.backend.domain.mbti.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
}
