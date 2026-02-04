package com.teamlms.backend.domain.mentoring.repository;

import com.teamlms.backend.domain.mentoring.entity.MentoringApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MentoringApplicationRepository extends JpaRepository<MentoringApplication, Long> {
}
