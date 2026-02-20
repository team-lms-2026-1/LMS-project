package com.teamlms.backend.domain.mbti.repository;

import com.teamlms.backend.domain.mbti.entity.JobCatalogI18n;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface JobCatalogI18nRepository extends JpaRepository<JobCatalogI18n, Long> {
    @Query("SELECT j FROM JobCatalogI18n j WHERE j.jobCatalog.id = :jobId AND j.locale = :locale")
    Optional<JobCatalogI18n> findByJobCatalogIdAndLocale(@Param("jobId") Long jobId, @Param("locale") String locale);
}
