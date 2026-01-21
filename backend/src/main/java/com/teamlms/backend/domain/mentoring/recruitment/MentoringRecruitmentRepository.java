package com.teamlms.backend.domain.mentoring.recruitment;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MentoringRecruitmentRepository extends JpaRepository<MentoringRecruitment, Long> {
    Page<MentoringRecruitment> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);
}
