package com.teamlms.backend.domain.mentoring.application;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MentoringApplicationRepository extends JpaRepository<MentoringApplication, Long> {

    @Query("""
        select a
        from MentoringApplication a
        where (:recruitmentId is null or a.recruitment.id = :recruitmentId)
          and (:role is null or a.role = :role)
          and (:status is null or a.status = :status)
          and (:keyword is null or :keyword = '' or lower(a.name) like lower(concat('%', :keyword, '%')))
    """)
    Page<MentoringApplication> search(
            @Param("recruitmentId") Long recruitmentId,
            @Param("role") ApplicationRole role,
            @Param("status") ApplicationStatus status,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    long countByRecruitment_IdAndRole(Long recruitmentId, ApplicationRole role);
    long countByRecruitment_IdAndRoleAndStatus(Long recruitmentId, ApplicationRole role, ApplicationStatus status);

    List<MentoringApplication> findByRecruitment_IdAndRoleAndStatus(Long recruitmentId, ApplicationRole role, ApplicationStatus status);
}
