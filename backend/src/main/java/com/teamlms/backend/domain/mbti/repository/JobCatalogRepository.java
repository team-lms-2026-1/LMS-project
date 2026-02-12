package com.teamlms.backend.domain.mbti.repository;

import com.teamlms.backend.domain.mbti.entity.JobCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface JobCatalogRepository extends JpaRepository<JobCatalog, Long> {

    @Query("select max(j.version) from JobCatalog j")
    String findLatestVersion();

    List<JobCatalog> findByVersionOrderByIdAsc(String version);
}
