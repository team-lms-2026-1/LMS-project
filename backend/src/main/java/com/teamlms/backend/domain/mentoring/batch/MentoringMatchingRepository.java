package com.teamlms.backend.domain.mentoring.batch;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MentoringMatchingRepository extends JpaRepository<MentoringMatching, Long> {
    List<MentoringMatching> findByRecruitment_Id(Long recruitmentId);
    boolean existsByRecruitment_Id(Long recruitmentId);
}
