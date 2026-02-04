package com.teamlms.backend.domain.mentoring.repository;

import com.teamlms.backend.domain.mentoring.entity.MentoringRecruitment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MentoringRecruitmentRepository extends JpaRepository<MentoringRecruitment, Long> {
}
