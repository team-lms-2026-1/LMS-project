package com.teamlms.backend.domain.job.repository;

import com.teamlms.backend.domain.job.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobPostingRepository extends JpaRepository<JobPosting, String> {
}