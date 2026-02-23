package com.teamlms.backend.domain.mentoring.repository;

import com.teamlms.backend.domain.mentoring.entity.MentoringRecruitment;
import com.teamlms.backend.domain.mentoring.enums.MentoringRecruitmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MentoringRecruitmentRepository extends JpaRepository<MentoringRecruitment, Long> {
    Page<MentoringRecruitment> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);
    Page<MentoringRecruitment> findByStatus(MentoringRecruitmentStatus status, Pageable pageable);
    Page<MentoringRecruitment> findByStatusAndTitleContainingIgnoreCase(MentoringRecruitmentStatus status, String keyword, Pageable pageable);
    boolean existsBySemesterId(Long semesterId);
}
